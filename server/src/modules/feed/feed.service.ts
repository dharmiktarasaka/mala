import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, CreateCommentDto } from './dto/feed.dto';
import { PostCategory } from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: dto.content,
        category: dto.category || PostCategory.GENERAL,
        visibility: dto.visibility || 'PUBLIC',
        media: dto.mediaUrl
          ? {
              create: {
                mediaUrl: dto.mediaUrl,
                mediaType: 'IMAGE',
              },
            }
          : undefined,
      },
      include: {
        user: { include: { profile: true } },
        media: true,
      },
    });

    return post;
  }

  async getFeed(
    userId: string,
    filter: 'home' | 'friends' | 'explore' = 'home',
    category?: PostCategory,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (filter === 'friends') {
      const friends = await this.prisma.friend.findMany({
        where: { userId },
        select: { friendId: true },
      });
      const friendIds = friends.map((f) => f.friendId);
      where.userId = { in: friendIds };
      where.visibility = { in: ['PUBLIC', 'FRIENDS_ONLY'] };
    } else {
      // Home / Explore Feed: Public posts, plus friends' posts, and user's own posts
      const friends = await this.prisma.friend.findMany({
        where: { userId },
        select: { friendId: true },
      });
      const friendIds = friends.map((f) => f.friendId);

      where.OR = [
        { visibility: 'PUBLIC' },
        { userId, visibility: 'PRIVATE' },
        { userId: { in: friendIds }, visibility: 'FRIENDS_ONLY' },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          media: true,
          likes: { where: { userId }, select: { id: true } },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { include: { profile: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: posts.map((p) => ({
        id: p.id,
        content: p.content,
        category: p.category,
        visibility: p.visibility,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt,
        isLikedByMe: p.likes.length > 0,
        author: {
          id: p.user.id,
          username: p.user.username,
          displayName: p.user.profile?.displayName || p.user.username,
          avatarUrl: p.user.profile?.avatarUrl,
        },
        media: p.media,
        recentComments: p.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          author: {
            id: c.user.id,
            username: c.user.username,
            displayName: c.user.profile?.displayName || c.user.username,
          },
        })),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      await this.prisma.$transaction([
        this.prisma.like.delete({ where: { id: existingLike.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false, likesCount: Math.max(0, post.likesCount - 1) };
    } else {
      await this.prisma.$transaction([
        this.prisma.like.create({ data: { postId, userId } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      if (post.userId !== userId) {
        const actor = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
        await this.prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'POST_LIKE',
            title: 'New Like',
            body: `@${actor?.username || 'A devotee'} liked your post`,
            dataJson: JSON.stringify({ postId }),
          },
        });
      }

      return { liked: true, likesCount: post.likesCount + 1 };
    }
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          postId,
          userId,
          parentId: dto.parentId,
          content: dto.content,
        },
        include: {
          user: { include: { profile: true } },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    if (post.userId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'POST_COMMENT',
          title: 'New Comment',
          body: `@${comment.user.username} commented on your post`,
          dataJson: JSON.stringify({ postId, commentId: comment.id }),
        },
      });
    }

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.user.id,
        username: comment.user.username,
        displayName: comment.user.profile?.displayName || comment.user.username,
        avatarUrl: comment.user.profile?.avatarUrl,
      },
    };
  }

  async getComments(postId: string, limit = 50) {
    return this.prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: { include: { profile: true } },
        replies: {
          include: { user: { include: { profile: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isOwner = post.userId === userId;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true, message: 'Post deleted successfully' };
  }
}

