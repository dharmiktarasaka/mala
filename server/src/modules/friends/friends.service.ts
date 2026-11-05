import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(senderId: string, targetIdentifier: string) {
    const target = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: targetIdentifier },
          { username: targetIdentifier.toLowerCase().trim() },
        ],
      },
      include: { profile: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.id === senderId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    // Check if already friends
    const existingFriend = await this.prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: senderId,
          friendId: target.id,
        },
      },
    });

    if (existingFriend) {
      throw new ConflictException('You are already friends with this devotee');
    }

    // Check for blocked status
    const isBlocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: target.id },
          { blockerId: target.id, blockedId: senderId },
        ],
      },
    });

    if (isBlocked) {
      throw new BadRequestException('Unable to send friend request');
    }

    // Check existing pending request
    const existingReq = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: target.id },
          { senderId: target.id, receiverId: senderId },
        ],
      },
    });

    if (existingReq) {
      if (existingReq.status === 'PENDING') {
        if (existingReq.senderId === target.id) {
          // Cross-request: auto-accept!
          return this.respondToRequest(senderId, existingReq.id, 'ACCEPTED');
        }
        throw new ConflictException('Friend request is already pending');
      }
    }

    const request = await this.prisma.friendRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: target.id,
        },
      },
      create: {
        senderId,
        receiverId: target.id,
        status: 'PENDING',
      },
      update: {
        status: 'PENDING',
      },
      include: {
        receiver: { include: { profile: true } },
      },
    });

    // Create notification
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      include: { profile: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: target.id,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        body: `@${sender?.username || 'A devotee'} sent you a friend request`,
        dataJson: JSON.stringify({ requestId: request.id, senderId }),
      },
    });

    return {
      success: true,
      message: 'Friend request sent',
      request,
    };
  }

  async respondToRequest(
    userId: string,
    requestId: string,
    action: 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
  ) {
    const req = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    if (!req) {
      throw new NotFoundException('Friend request not found');
    }

    if (action === 'CANCELLED') {
      if (req.senderId !== userId) {
        throw new BadRequestException('Only the sender can cancel this request');
      }
      await this.prisma.friendRequest.delete({ where: { id: requestId } });
      return { success: true, message: 'Friend request cancelled' };
    }

    // Only receiver can accept or reject
    if (req.receiverId !== userId) {
      throw new BadRequestException('Only the recipient can respond to this request');
    }

    if (action === 'REJECTED') {
      await this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      return { success: true, message: 'Friend request rejected' };
    }

    // ACCEPTED: Create mutual friend entries atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      await tx.friend.upsert({
        where: { userId_friendId: { userId: req.senderId, friendId: req.receiverId } },
        create: { userId: req.senderId, friendId: req.receiverId },
        update: {},
      });

      await tx.friend.upsert({
        where: { userId_friendId: { userId: req.receiverId, friendId: req.senderId } },
        create: { userId: req.receiverId, friendId: req.senderId },
        update: {},
      });

      // Notify the sender
      await tx.notification.create({
        data: {
          userId: req.senderId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          body: `@${req.receiver.username} accepted your friend request`,
          dataJson: JSON.stringify({ friendId: req.receiverId }),
        },
      });
    });

    return { success: true, message: 'Friend request accepted' };
  }

  async getMyFriends(userId: string) {
    const friends = await this.prisma.friend.findMany({
      where: { userId },
      include: {
        friend: {
          include: {
            profile: true,
            wallet: true,
            practiceStatistics: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return friends.map((f) => ({
      friendshipId: f.id,
      userId: f.friend.id,
      username: f.friend.username,
      displayName: f.friend.profile?.displayName || f.friend.username,
      avatarUrl: f.friend.profile?.avatarUrl,
      bio: f.friend.profile?.bio,
      lifetimeMala: f.friend.profile?.showMalaCount
        ? f.friend.practiceStatistics?.lifetimeCount
        : null,
      since: f.createdAt,
    }));
  }

  async getPendingRequests(userId: string) {
    const [incoming, sent] = await Promise.all([
      this.prisma.friendRequest.findMany({
        where: { receiverId: userId, status: 'PENDING' },
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.friendRequest.findMany({
        where: { senderId: userId, status: 'PENDING' },
        include: { receiver: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      incoming: incoming.map((r) => ({
        requestId: r.id,
        user: {
          id: r.sender.id,
          username: r.sender.username,
          displayName: r.sender.profile?.displayName || r.sender.username,
          avatarUrl: r.sender.profile?.avatarUrl,
        },
        createdAt: r.createdAt,
      })),
      sent: sent.map((r) => ({
        requestId: r.id,
        user: {
          id: r.receiver.id,
          username: r.receiver.username,
          displayName: r.receiver.profile?.displayName || r.receiver.username,
          avatarUrl: r.receiver.profile?.avatarUrl,
        },
        createdAt: r.createdAt,
      })),
    };
  }

  async removeFriend(userId: string, friendId: string) {
    await this.prisma.$transaction([
      this.prisma.friend.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      }),
      this.prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
      }),
    ]);

    return { success: true, message: 'Friend removed' };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    await this.prisma.$transaction([
      this.prisma.blockedUser.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        create: { blockerId, blockedId },
        update: {},
      }),
      // Sever friendship if existing
      this.prisma.friend.deleteMany({
        where: {
          OR: [
            { userId: blockerId, friendId: blockedId },
            { userId: blockedId, friendId: blockerId },
          ],
        },
      }),
    ]);

    return { success: true, message: 'User blocked' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.blockedUser.deleteMany({
      where: { blockerId, blockedId },
    });
    return { success: true, message: 'User unblocked' };
  }

  async getSuggestions(userId: string, limit = 5) {
    const existingFriends = await this.prisma.friend.findMany({
      where: { userId },
      select: { friendId: true },
    });

    const excludeIds = [userId, ...existingFriends.map((f) => f.friendId)];

    const users = await this.prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        practiceStatistics: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.profile?.displayName || u.username,
      avatarUrl: u.profile?.avatarUrl,
      bio: u.profile?.bio,
    }));
  }
}

