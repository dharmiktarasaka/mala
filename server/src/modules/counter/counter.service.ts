import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordSessionDto, LogDateDto } from './dto/counter.dto';

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
          currentStreakDays: 0,
          longestStreakDays: 0,
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
      // Determine date of session
      let sessionDate = new Date();
      if (dto.sessionDate) {
        const parsed = new Date(dto.sessionDate.includes('T') ? dto.sessionDate : `${dto.sessionDate}T12:00:00Z`);
        if (!isNaN(parsed.getTime())) {
          sessionDate = parsed;
        }
      }

      const chosenType = dto.malaType || 'daily_sankalp';

      // 1. Create practice session record
      const session = await (tx.malaPracticeSession.create as any)({
        data: {
          userId,
          beadCount: dto.beadCount,
          targetCount: dto.targetCount,
          durationSeconds: dto.durationSeconds,
          completedTarget: dto.completedTarget,
          soundEnabled: dto.soundEnabled ?? true,
          vibrationEnabled: dto.vibrationEnabled ?? true,
          malaType: chosenType,
          note: dto.note,
          startedAt: sessionDate,
          completedAt: sessionDate,
        },
      });

      // 2. Fetch current statistics
      let stats = await tx.practiceStatistics.findUnique({
        where: { userId },
      });

      const now = new Date();
      const isToday =
        now.getFullYear() === sessionDate.getFullYear() &&
        now.getMonth() === sessionDate.getMonth() &&
        now.getDate() === sessionDate.getDate();

      let newStreak = stats?.currentStreakDays || (isToday ? 1 : 0);
      let newDaily = stats?.currentDailyCount || 0;

      if (isToday) {
        newDaily += dto.beadCount;
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
        } else {
          newStreak = 1;
        }
      }

      const newLifetime = (stats?.lifetimeCount || 0) + dto.beadCount;
      const longestStreak = Math.max(stats?.longestStreakDays || 0, newStreak);

      const updatedStats = await tx.practiceStatistics.upsert({
        where: { userId },
        create: {
          userId,
          currentDailyCount: newDaily,
          lifetimeCount: newLifetime,
          currentStreakDays: newStreak,
          longestStreakDays: longestStreak,
          lastPracticeDate: isToday ? now : stats?.lastPracticeDate || now,
          totalSessions: 1,
        },
        update: {
          currentDailyCount: newDaily,
          lifetimeCount: newLifetime,
          currentStreakDays: newStreak,
          longestStreakDays: longestStreak,
          lastPracticeDate: isToday ? now : stats?.lastPracticeDate || now,
          totalSessions: { increment: 1 },
        },
      });

      // 3. Trigger achievement evaluations
      await this.evaluatePracticeAchievements(tx, userId, updatedStats.lifetimeCount, newStreak);

      // 4. Credit earned Mala to devotee wallet (1 Mala per 108 chants completed)
      const earnedMala = Math.floor(dto.beadCount / 108) || (dto.completedTarget ? 1 : 0);
      let walletResult: any = null;
      if (earnedMala > 0) {
        try {
          walletResult = await (tx.wallet.update as any)({
            where: { userId },
            data: {
              balance: { increment: earnedMala },
              totalEarned: { increment: earnedMala },
              pocketCredit: {
                pocket: chosenType,
                amount: earnedMala,
              },
            } as any,
          });
        } catch {}
      }

      return {
        session,
        earnedMala,
        pocketCredited: chosenType,
        walletBalance: walletResult?.balance,
        pockets: walletResult?.pockets,
        sessionDate: sessionDate.toISOString().slice(0, 10),
        statistics: {
          dailyCount: updatedStats.currentDailyCount,
          lifetimeCount: updatedStats.lifetimeCount,
          currentStreakDays: updatedStats.currentStreakDays,
          longestStreakDays: updatedStats.longestStreakDays,
        },
      };
    });
  }

  async getSessionHistory(userId: string, limit = 50) {
    return this.prisma.malaPracticeSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  async getCalendarData(userId: string, yearMonth?: string) {
    const targetMonth = yearMonth || new Date().toISOString().slice(0, 7);
    const sessions = await this.prisma.malaPracticeSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    const days: Record<
      string,
      {
        date: string;
        totalBeads: number;
        totalMalas: number;
        sessionsCount: number;
        pockets: Record<string, number>;
        sessions: any[];
      }
    > = {};

    let totalMalasInMonth = 0;
    let totalBeadsInMonth = 0;

    for (const s of (sessions as any[])) {
      const sDate = new Date(s.completedAt || s.startedAt);
      if (isNaN(sDate.getTime())) continue;
      const dateKey = sDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const monthKey = dateKey.slice(0, 7); // "YYYY-MM"

      if (monthKey === targetMonth) {
        const malas = Math.floor(s.beadCount / 108) || (s.completedTarget ? 1 : 0);
        totalMalasInMonth += malas;
        totalBeadsInMonth += s.beadCount;

        if (!days[dateKey]) {
          days[dateKey] = {
            date: dateKey,
            totalBeads: 0,
            totalMalas: 0,
            sessionsCount: 0,
            pockets: {
              divya_mahamala: 0,
              jackpot: 0,
              ram_ram: 0,
              extra: 0,
              bonus: 0,
              daily_sankalp: 0,
            },
            sessions: [],
          };
        }

        days[dateKey].totalBeads += s.beadCount;
        days[dateKey].totalMalas += malas;
        days[dateKey].sessionsCount += 1;
        const pkt = s.malaType || 'daily_sankalp';
        if (days[dateKey].pockets[pkt] !== undefined) {
          days[dateKey].pockets[pkt] += malas;
        }
        days[dateKey].sessions.push({
          id: s.id,
          beadCount: s.beadCount,
          targetCount: s.targetCount,
          durationSeconds: s.durationSeconds,
          completedTarget: s.completedTarget,
          malaType: pkt,
          note: s.note,
          time: sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completedAt: sDate,
        });
      }
    }

    return {
      month: targetMonth,
      totalMalasInMonth,
      totalBeadsInMonth,
      activeDaysInMonth: Object.keys(days).length,
      days,
    };
  }

  async logMalaForDate(userId: string, dto: LogDateDto) {
    const malas = dto.malas || (dto.beads ? Math.floor(dto.beads / 108) : 1);
    const beadCount = dto.beads || (malas * 108);
    const chosenType = dto.malaType || 'daily_sankalp';
    const targetDate = new Date(`${dto.date}T12:00:00Z`);

    return this.recordSession(userId, {
      beadCount,
      targetCount: beadCount,
      durationSeconds: malas * 600,
      completedTarget: true,
      malaType: chosenType,
      sessionDate: targetDate.toISOString(),
      note: dto.note,
      soundEnabled: true,
      vibrationEnabled: true,
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

