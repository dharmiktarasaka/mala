import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    // 1. Ensure master achievements exist
    await this.seedDefaultAchievementsIfEmpty();

    const achievements = await this.prisma.achievement.findMany();
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const userAchMap = new Map<string, any>(userAchievements.map((ua) => [ua.achievementId, ua]));

    return achievements.map((ach) => {
      const userAch = userAchMap.get(ach.id);
      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        iconName: ach.iconName,
        targetValue: ach.targetValue,
        category: ach.category,
        isUnlocked: userAch?.isUnlocked || false,
        progress: userAch?.progress || 0,
        unlockedAt: userAch?.unlockedAt || null,
      };
    });
  }

  private async seedDefaultAchievementsIfEmpty() {
    const count = await this.prisma.achievement.count();
    if (count > 0) return;

    const defaults = [
      {
        code: 'FIRST_MALA',
        name: 'First Step',
        description: 'Complete your first digital Mala count',
        iconName: 'flower-outline',
        targetValue: 1,
        category: 'PRACTICE',
      },
      {
        code: 'MALA_108',
        name: 'Sacred 108',
        description: 'Count a complete traditional 108 bead Mala',
        iconName: 'sunny-outline',
        targetValue: 108,
        category: 'PRACTICE',
      },
      {
        code: 'STREAK_7',
        name: '7-Day Devotion',
        description: 'Practice Mala continuously for 7 consecutive days',
        iconName: 'flame-outline',
        targetValue: 7,
        category: 'STREAK',
      },
      {
        code: 'STREAK_30',
        name: 'Monthly Sadhana',
        description: 'Complete 30 consecutive days of spiritual chanting',
        iconName: 'sparkles-outline',
        targetValue: 30,
        category: 'STREAK',
      },
      {
        code: 'MALA_1008',
        name: 'Mahasadhak 1,008',
        description: 'Reach 1,008 total Mala repetitions',
        iconName: 'ribbon-outline',
        targetValue: 1008,
        category: 'PRACTICE',
      },
      {
        code: 'MALA_10000',
        name: 'Divine 10,000 Milestone',
        description: 'Reach an extraordinary 10,000 lifetime Mala counts',
        iconName: 'diamond-outline',
        targetValue: 10000,
        category: 'PRACTICE',
      },
      {
        code: 'FIRST_TRANSFER',
        name: 'Spiritual Offering',
        description: 'Send your first Mala offering to another devotee',
        iconName: 'gift-outline',
        targetValue: 1,
        category: 'TRANSFER',
      },
      {
        code: 'FIRST_RECEIVED',
        name: 'Divine Blessings',
        description: 'Receive your first Mala transfer from a friend',
        iconName: 'heart-outline',
        targetValue: 1,
        category: 'TRANSFER',
      },
    ];

    for (const item of defaults) {
      await this.prisma.achievement.upsert({
        where: { code: item.code },
        create: item,
        update: {},
      });
    }
  }
}
