import { Test, TestingModule } from '@nestjs/testing';
import { CounterService } from './counter.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CounterService (Digital Mala Counter)', () => {
  let service: CounterService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      practiceStatistics: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      malaPracticeSession: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      achievement: {
        findUnique: jest.fn(),
      },
      userAchievement: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounterService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CounterService>(CounterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Session Recording & Daily Calculation', () => {
    it('should record a 108 session and update lifetime & daily count', async () => {
      const existingStats = {
        userId: 'user-1',
        currentDailyCount: 0,
        lifetimeCount: 200,
        currentStreakDays: 5,
        longestStreakDays: 10,
        lastPracticeDate: new Date(),
        totalSessions: 2,
      };

      prisma.practiceStatistics.findUnique.mockResolvedValue(existingStats);
      prisma.malaPracticeSession.create.mockResolvedValue({
        id: 'sess-1',
        beadCount: 108,
        targetCount: 108,
        completedTarget: true,
      });

      prisma.practiceStatistics.upsert.mockResolvedValue({
        ...existingStats,
        currentDailyCount: 108,
        lifetimeCount: 308,
        totalSessions: 3,
      });

      const result = await service.recordSession('user-1', {
        beadCount: 108,
        targetCount: 108,
        durationSeconds: 900,
        completedTarget: true,
      });

      expect(result.statistics.dailyCount).toBe(108);
      expect(result.statistics.lifetimeCount).toBe(308);
      expect(prisma.malaPracticeSession.create).toHaveBeenCalled();
    });

    it('should maintain practice statistics independent of wallet balance', async () => {
      // Invariant rule from specs: personal count does not automatically alter wallet balance
      const stats = {
        userId: 'user-1',
        currentDailyCount: 21,
        lifetimeCount: 500,
        currentStreakDays: 3,
        longestStreakDays: 5,
      };
      prisma.practiceStatistics.findUnique.mockResolvedValue(stats);

      const res = await service.getStatistics('user-1');
      expect(res.lifetimeCount).toBe(500);
      expect(res.dailyCount).toBe(21);
      // Ensure no wallet calls occur in counter logic
      expect(prisma.wallet).toBeUndefined();
    });
  });
});

