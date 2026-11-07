import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, UpdatePrivacySettingsDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        wallet: true,
        practiceStatistics: true,
        subscriptions: { where: { status: 'ACTIVE' }, take: 1 },
        _count: {
          select: {
            friends: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      devoteeId: (user as any).devoteeId || user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      profile: user.profile,
      wallet: {
        balance: user.wallet?.balance || 0,
        totalReceived: user.wallet?.totalReceived || 0,
        totalSent: user.wallet?.totalSent || 0,
        totalEarned: user.wallet?.totalEarned || 0,
      },
      practiceStatistics: user.practiceStatistics,
      subscription: user.subscriptions[0] || { plan: 'FREE', status: 'ACTIVE' },
      friendsCount: user._count.friends,
      postsCount: user._count.posts,
    };
  }

  async getPublicProfile(viewerId: string, targetIdentifier: string) {
    const cleanId = targetIdentifier.trim();
    const targetUser: any = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { devoteeId: cleanId },
          { username: cleanId.toLowerCase() },
        ],
      } as any,
      include: {
        profile: true,
        wallet: true,
        practiceStatistics: true,
        _count: {
          select: {
            friends: true,
            posts: true,
          },
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User profile not found');
    }

    // Check if targetUser has blocked viewer or viewer has blocked targetUser
    const isBlocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: targetUser.id },
          { blockerId: targetUser.id, blockedId: viewerId },
        ],
      },
    });

    if (isBlocked) {
      throw new ForbiddenException('Profile cannot be viewed');
    }

    const isFriend = await this.prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: viewerId,
          friendId: targetUser.id,
        },
      },
    });

    const isSelf = viewerId === targetUser.id;
    const profile = targetUser.profile;

    return {
      id: targetUser.id,
      devoteeId: targetUser.devoteeId || targetUser.id,
      username: targetUser.username,
      displayName: profile?.displayName || targetUser.username,
      bio: profile?.bio,
      avatarUrl: profile?.avatarUrl,
      createdAt: targetUser.createdAt,
      isFriend: !!isFriend,
      isSelf,
      friendsCount: targetUser._count.friends,
      postsCount: targetUser._count.posts,
      // Privacy guards:
      malaCount: isSelf || profile?.showMalaCount ? targetUser.practiceStatistics?.lifetimeCount : null,
      walletBalance: isSelf || profile?.showWalletBalance ? targetUser.wallet?.balance : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: dto.displayName || 'Devotee',
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        preferredLanguage: dto.preferredLanguage || 'en',
        theme: dto.theme || 'saffron',
      },
      update: {
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        preferredLanguage: dto.preferredLanguage,
        theme: dto.theme,
      },
    });

    return profile;
  }

  async updatePrivacySettings(userId: string, dto: UpdatePrivacySettingsDto) {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        isPrivate: dto.isPrivate,
        showMalaCount: dto.showMalaCount,
        showWalletBalance: dto.showWalletBalance,
      },
    });

    return {
      isPrivate: profile.isPrivate,
      showMalaCount: profile.showMalaCount,
      showWalletBalance: profile.showWalletBalance,
    };
  }

  async searchUsers(query: string, currentUserId: string, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        status: 'ACTIVE',
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { profile: { displayName: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        profile: true,
      },
      take: limit,
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

