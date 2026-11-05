import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordSessionDto } from './dto/counter.dto';

@Injectable()
export class CounterService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(userId: string) {
    let stats = await this.prisma.practiceStatistics.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await this.prisma.practiceStatistics.create({
        data: {
          userId,
          currentDailyCount: 0,
          lifetimeCount: 0,
          currentStreakDays: 1,
          longestStreakDays: 1,
        },
      });
    }

    // Check if daily count needs rollover
    const now = new Date();
    if (stats.lastPracticeDate) {
      const isSameDay =
        now.getFullYear() === stats.lastPracticeDate.getFullYear() &&
        now.getMonth() === stats.lastPracticeDate.getMonth() &&
        now.getDate() === stats.lastPracticeDate.getDate();

      if (!isSameDay) {
        // Rollover daily count
        stats = await this.prisma.practiceStatistics.update({
          where: { userId },
          data: { currentDailyCount: 0 },
        });
      }
    }

    return {
      dailyCount: stats.currentDailyCount,
      lifetimeCount: stats.lifetimeCount,
      currentStreakDays: stats.currentStreakDays,
      longestStreakDays: stats.longestStreakDays,
      totalSessions: stats.totalSessions,
      lastPracticeDate: stats.lastPracticeDate,
    };
  }

  async recordSession(userId: string, dto: RecordSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create practice session record
      const session = await tx.malaPracticeSession.create({
        data: {
          userId,
          beadCount: dto.beadCount,
          targetCount: dto.targetCount,
          durationSeconds: dto.durationSeconds,
          completedTarget: dto.completedTarget,
          soundEnabled: dto.soundEnabled ?? true,
          vibrationEnabled: dto.vibrationEnabled ?? true,
          completedAt: new Date(),
        },
      });

      // 2. Fetch current statistics
      let stats = await tx.practiceStatistics.findUnique({
        where: { userId },
      });

      const now = new Date();
      let newStreak = stats?.currentStreakDays || 1;
      let newDaily = (stats?.currentDailyCount || 0) + dto.beadCount;

      if (stats?.lastPracticeDate) {
        const last = new Date(stats.lastPracticeDate);
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const isSameDay =
          now.getFullYear() === last.getFullYear() &&
          now.getMonth() === last.getMonth() &&
          now.getDate() === last.getDate();

        if (!isSameDay) {
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1; // streak reset
          }
          newDaily = dto.beadCount; // reset daily count for new day
        }
      }

      const newLifetime = (stats?.lifetimeCount || 0) + dto.beadCount;
      const longestStreak = Math.max(stats?.longestStreakDays || 1, newStreak);

      const updatedStats = await tx.practiceStatistics.upsert({
        where: { userId },
        create: {
          userId,
          currentDailyCount: newDaily,
          lifetimeCount: newLifetime,
          currentStreakDays: newStreak,
          longestStreakDays: longestStreak,
          lastPracticeDate: now,
          totalSessions: 1,
        },
        update: {
          currentDailyCount: newDaily,
          lifetimeCount: newLifetime,
          currentStreakDays: newStreak,
          longestStreakDays: longestStreak,
          lastPracticeDate: now,
          totalSessions: { increment: 1 },
        },
      });

      // 3. Trigger achievement evaluations
      await this.evaluatePracticeAchievements(tx, userId, updatedStats.lifetimeCount, newStreak);

      return {
        session,
        statistics: {
          dailyCount: updatedStats.currentDailyCount,
          lifetimeCount: updatedStats.lifetimeCount,
          currentStreakDays: updatedStats.currentStreakDays,
          longestStreakDays: updatedStats.longestStreakDays,
        },
      };
    });
  }

  async getSessionHistory(userId: string, limit = 20) {
    return this.prisma.malaPracticeSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  private async evaluatePracticeAchievements(
    tx: any,
    userId: string,
    lifetimeCount: number,
    streak: number,
  ) {
    const milestones = [
      { code: 'FIRST_MALA', target: 1, name: 'First Mala Step' },
      { code: 'MALA_108', target: 108, name: 'Sacred 108 Mala' },
      { code: 'MALA_1008', target: 1008, name: 'Grand 1,008 Devotee' },
      { code: 'MALA_10000', target: 10000, name: 'Divine 10,000 Milestone' },
    ];

    for (const m of milestones) {
      if (lifetimeCount >= m.target) {
        const ach = await tx.achievement.findUnique({ where: { code: m.code } });
        if (ach) {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: ach.id,
              },
            },
            create: {
              userId,
              achievementId: ach.id,
              progress: 100,
              isUnlocked: true,
              unlockedAt: new Date(),
            },
            update: {
              progress: 100,
              isUnlocked: true,
            },
          });
        }
      }
    }
  }
}

