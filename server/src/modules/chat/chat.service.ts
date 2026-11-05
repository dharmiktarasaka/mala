import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(userAId: string, userBIdentifier: string) {
    const userB = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userBIdentifier }, { username: userBIdentifier.toLowerCase().trim() }],
      },
    });

    if (!userB) {
      throw new NotFoundException('Devotee not found');
    }

    if (userAId === userB.id) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    // Check block list
    const isBlocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userAId, blockedId: userB.id },
          { blockerId: userB.id, blockedId: userAId },
        ],
      },
    });

    if (isBlocked) {
      throw new BadRequestException('Unable to send messages to this user');
    }

    // Deterministic ordering to enforce unique 1-to-1 conversation
    const [p1, p2] = userAId < userB.id ? [userAId, userB.id] : [userB.id, userAId];

    let conversation = await this.prisma.conversation.findUnique({
      where: {
        participantOneId_participantTwoId: {
          participantOneId: p1,
          participantTwoId: p2,
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participantOneId: p1,
          participantTwoId: p2,
        },
      });
    }

    return conversation;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Populate other participant details
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.participantOneId === userId ? conv.participantTwoId : conv.participantOneId;

        const otherUser = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          include: { profile: true },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          otherUser: {
            id: otherUser?.id,
            username: otherUser?.username,
            displayName: otherUser?.profile?.displayName || otherUser?.username,
            avatarUrl: otherUser?.profile?.avatarUrl,
          },
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      }),
    );

    return result;
  }

  async getMessages(userId: string, conversationId: string, limit = 50) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    // Critical Security Check: User isolation
    if (conv.participantOneId !== userId && conv.participantTwoId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Automatically mark unread messages as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return messages;
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const conversation = await this.getOrCreateConversation(
      senderId,
      dto.recipientIdentifier,
    );

    const receiverId =
      conversation.participantOneId === senderId
        ? conversation.participantTwoId
        : conversation.participantOneId;

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          receiverId,
          content: dto.content,
          mediaUrl: dto.mediaUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageId: msg.id,
          lastMessageAt: msg.createdAt,
        },
      });

      return msg;
    });

    return message;
  }
}

