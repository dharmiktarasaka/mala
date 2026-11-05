import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  async getPlatformAnalytics() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalPosts,
      totalTransactions,
      practiceStatsAggregate,
      ledgerVolume,
      subscriptionsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: { in: ['SUSPENDED', 'BANNED'] } } }),
      this.prisma.post.count(),
      this.prisma.ledgerTransaction.count(),
      this.prisma.practiceStatistics.aggregate({
        _sum: {
          lifetimeCount: true,
          currentDailyCount: true,
          totalSessions: true,
        },
      }),
      this.prisma.ledgerTransaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        premiumSubscribers: subscriptionsCount,
      },
      spiritualStats: {
        totalMalaCountedLifetime: practiceStatsAggregate._sum.lifetimeCount || 0,
        totalMalaCountedToday: practiceStatsAggregate._sum.currentDailyCount || 0,
        totalPracticeSessions: practiceStatsAggregate._sum.totalSessions || 0,
      },
      ledgerStats: {
        totalTransactions,
        totalMalaTransferred: ledgerVolume._sum.amount || 0,
      },
      communityStats: {
        totalPosts,
      },
      systemHealth: 'HEALTHY',
      timestamp: new Date().toISOString(),
    };
  }

  async listUsers(query?: string, status?: UserStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (query) {
      const q = query.trim().toLowerCase();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: true,
          wallet: true,
          practiceStatistics: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        displayName: u.profile?.displayName,
        walletBalance: u.wallet?.balance || 0,
        lifetimeMala: u.practiceStatistics?.lifetimeCount || 0,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(
    adminId: string,
    targetUserId: string,
    status: UserStatus,
    reason: string,
  ) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Mandatory reason required for user status changes');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const beforeStatus = user.status;

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: targetUserId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: `USER_STATUS_CHANGE_${status}`,
          targetType: 'USER',
          targetId: targetUserId,
          reason,
          beforeStateJson: JSON.stringify({ status: beforeStatus }),
          afterStateJson: JSON.stringify({ status }),
        },
      });

      return u;
    });

    return {
      success: true,
      userId: updatedUser.id,
      previousStatus: beforeStatus,
      newStatus: updatedUser.status,
    };
  }

  async reconcileUserWallet(walletId: string) {
    return this.ledgerService.reconcileWallet(walletId);
  }

  async executeAdminAdjustment(
    adminUserId: string,
    targetUserId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    reason: string,
  ) {
    return this.ledgerService.executeAdminAdjustment({
      adminUserId,
      targetUserId,
      amount,
      type,
      reason,
    });
  }

  async listAuditLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      include: {
        admin: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

