import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mala database...');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('AdminPass@108', 10);

  // 1. Achievements
  const achievements = [
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

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      create: ach,
      update: {},
    });
  }

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin_devotee' },
    create: {
      username: 'admin_devotee',
      email: 'admin@mala.app',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Mala Platform Admin',
          bio: 'Platform Guardian and Community Moderator',
        },
      },
      wallet: {
        create: {
          balance: 100000,
          ledgerAccounts: {
            create: {
              accountType: 'SYSTEM_VAULT',
              currency: 'MALA',
              balance: 100000,
            },
          },
        },
      },
      practiceStatistics: {
        create: {
          currentDailyCount: 108,
          lifetimeCount: 10800,
          currentStreakDays: 100,
          longestStreakDays: 100,
        },
      },
      adminUser: {
        create: {
          role: 'ADMIN',
          permissionsJson: '["all"]',
        },
      },
    },
    update: {},
  });

  // 3. User A (Arjun - 100 Mala)
  const userA = await prisma.user.upsert({
    where: { username: 'user_a' },
    create: {
      username: 'user_a',
      email: 'user_a@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Arjun Devotee',
          bio: 'Chanting Om Namah Shivaya daily. Seeking inner peace.',
        },
      },
      wallet: {
        create: {
          balance: 100,
          totalEarned: 100,
          ledgerAccounts: {
            create: {
              accountType: 'USER_AVAILABLE',
              currency: 'MALA',
              balance: 100,
            },
          },
        },
      },
      practiceStatistics: {
        create: {
          currentDailyCount: 54,
          lifetimeCount: 1080,
          currentStreakDays: 12,
          longestStreakDays: 21,
        },
      },
    },
    update: {},
  });

  // 4. User B (Bhakti - 50 Mala)
  const userB = await prisma.user.upsert({
    where: { username: 'user_b' },
    create: {
      username: 'user_b',
      email: 'user_b@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Bhakti Seeker',
          bio: 'Hare Krishna! Practicing mindful japa meditation.',
        },
      },
      wallet: {
        create: {
          balance: 50,
          totalEarned: 50,
          ledgerAccounts: {
            create: {
              accountType: 'USER_AVAILABLE',
              currency: 'MALA',
              balance: 50,
            },
          },
        },
      },
      practiceStatistics: {
        create: {
          currentDailyCount: 108,
          lifetimeCount: 2160,
          currentStreakDays: 18,
          longestStreakDays: 30,
        },
      },
    },
    update: {},
  });

  // 5. User C (Chetan - 0 Mala)
  const userC = await prisma.user.upsert({
    where: { username: 'user_c' },
    create: {
      username: 'user_c',
      email: 'user_c@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Chetan Traveler',
          bio: 'Beginning my spiritual journey with digital mala.',
        },
      },
      wallet: {
        create: {
          balance: 0,
          ledgerAccounts: {
            create: {
              accountType: 'USER_AVAILABLE',
              currency: 'MALA',
              balance: 0,
            },
          },
        },
      },
      practiceStatistics: {
        create: {
          currentDailyCount: 0,
          lifetimeCount: 27,
          currentStreakDays: 2,
          longestStreakDays: 5,
        },
      },
    },
    update: {},
  });

  // Sample seed posts
  await prisma.post.create({
    data: {
      userId: userA.id,
      content: 'Morning 108 Gayatri Mantra completed with deep focus and calm. Wishing all devotees a blessed day! 🙏🕉️',
      category: 'PRACTICE',
      visibility: 'PUBLIC',
      likesCount: 5,
      commentsCount: 1,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Test Accounts:');
  console.log('- User A: user_a / Password@123 (Balance: 100 Mala)');
  console.log('- User B: user_b / Password@123 (Balance: 50 Mala)');
  console.log('- User C: user_c / Password@123 (Balance: 0 Mala)');
  console.log('- Admin: admin_devotee / AdminPass@108');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

