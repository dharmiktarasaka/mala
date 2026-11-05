import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WalletController } from '../src/modules/wallet/wallet.controller';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RequestUser } from '../src/common/decorators/current-user.decorator';

describe('End-to-End User Isolation & Mala Transfer Ledger Tests', () => {
  let walletController: WalletController;

  // Mock In-Memory State Database
  const usersDb = new Map<string, any>();
  const walletsDb = new Map<string, any>();
  const transactionsDb = new Map<string, any>();
  const entriesDb: any[] = [];
  const notificationsDb: any[] = [];

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id) return Promise.resolve(usersDb.get(where.id) || null);
        if (where.username) {
          for (const u of usersDb.values()) {
            if (u.username === where.username) return Promise.resolve(u);
          }
        }
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        for (const u of usersDb.values()) {
          if (where.OR) {
            for (const cond of where.OR) {
              if (cond.id && u.id === cond.id) return Promise.resolve(u);
              if (cond.username && u.username === cond.username) return Promise.resolve(u);
            }
          }
        }
        return Promise.resolve(null);
      }),
    },
    userProfile: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `p-${Date.now()}`, ...data })),
    },
    wallet: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.userId) {
          for (const w of walletsDb.values()) {
            if (w.userId === where.userId) return Promise.resolve(w);
          }
        }
        if (where.id) return Promise.resolve(walletsDb.get(where.id) || null);
        return Promise.resolve(null);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const w = walletsDb.get(where.id);
        if (!w) return Promise.resolve(null);
        if (typeof data.balance === 'number') w.balance = data.balance;
        if (data.totalSent?.increment) w.totalSent += data.totalSent.increment;
        if (data.totalReceived?.increment) w.totalReceived += data.totalReceived.increment;
        return Promise.resolve(w);
      }),
    },
    ledgerAccount: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `acc-${Date.now()}`, ...data })),
      update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
    },
    ledgerTransaction: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id) {
          const tx = transactionsDb.get(where.id);
          if (!tx) return Promise.resolve(null);
          const sourceWallet = walletsDb.get(tx.sourceWalletId);
          const targetWallet = walletsDb.get(tx.targetWalletId);
          return Promise.resolve({
            ...tx,
            sourceWallet: sourceWallet ? { ...sourceWallet, user: usersDb.get(sourceWallet.userId) } : null,
            targetWallet: targetWallet ? { ...targetWallet, user: usersDb.get(targetWallet.userId) } : null,
            entries: entriesDb.filter((e) => e.transactionId === tx.id),
          });
        }
        if (where.idempotencyKey) {
          for (const tx of transactionsDb.values()) {
            if (tx.idempotencyKey === where.idempotencyKey) {
              const sourceWallet = walletsDb.get(tx.sourceWalletId);
              const targetWallet = walletsDb.get(tx.targetWalletId);
              return Promise.resolve({
                ...tx,
                sourceWallet: sourceWallet ? { ...sourceWallet, user: usersDb.get(sourceWallet.userId) } : null,
                targetWallet: targetWallet ? { ...targetWallet, user: usersDb.get(targetWallet.userId) } : null,
              });
            }
          }
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(({ data }) => {
        const tx = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
          ...data,
        };
        transactionsDb.set(tx.id, tx);
        return Promise.resolve(tx);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const tx = transactionsDb.get(where.id);
        if (tx) Object.assign(tx, data);
        const sourceWallet = walletsDb.get(tx?.sourceWalletId);
        const targetWallet = walletsDb.get(tx?.targetWalletId);
        return Promise.resolve({
          ...tx,
          sourceWallet: sourceWallet ? { ...sourceWallet, user: usersDb.get(sourceWallet.userId) } : null,
          targetWallet: targetWallet ? { ...targetWallet, user: usersDb.get(targetWallet.userId) } : null,
        });
      }),
    },
    ledgerEntry: {
      create: jest.fn().mockImplementation(({ data }) => {
        const entry = { id: `entry-${Date.now()}`, ...data };
        entriesDb.push(entry);
        return Promise.resolve(entry);
      }),
    },
    blockedUser: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    notification: {
      create: jest.fn().mockImplementation(({ data }) => {
        notificationsDb.push(data);
        return Promise.resolve({ id: `notif-${Date.now()}`, ...data });
      }),
    },
    practiceStatistics: {
      findUnique: jest.fn().mockResolvedValue({ id: 'stats-1', lifetimeCount: 108, currentDailyCount: 108 }),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    }),
  };

  const userA: RequestUser = { userId: 'usr-a', username: 'user_a', role: 'USER' };
  const userB: RequestUser = { userId: 'usr-b', username: 'user_b', role: 'USER' };
  const userC: RequestUser = { userId: 'usr-c', username: 'user_c', role: 'USER' };

  beforeAll(async () => {
    // Populate User A (100 Mala)
    usersDb.set(userA.userId, {
      id: userA.userId,
      username: 'user_a',
      role: 'USER',
      status: 'ACTIVE',
      profile: { displayName: 'Arjun Devotee' },
    });
    walletsDb.set('w-a', {
      id: 'w-a',
      userId: userA.userId,
      balance: 100,
      totalSent: 0,
      totalReceived: 0,
      status: 'ACTIVE',
      user: usersDb.get(userA.userId),
      ledgerAccounts: [{ id: 'acc-a', accountType: 'USER_AVAILABLE', balance: 100 }],
    });

    // Populate User B (50 Mala)
    usersDb.set(userB.userId, {
      id: userB.userId,
      username: 'user_b',
      role: 'USER',
      status: 'ACTIVE',
      profile: { displayName: 'Bhakti Seeker' },
    });
    walletsDb.set('w-b', {
      id: 'w-b',
      userId: userB.userId,
      balance: 50,
      totalSent: 0,
      totalReceived: 0,
      status: 'ACTIVE',
      user: usersDb.get(userB.userId),
      ledgerAccounts: [{ id: 'acc-b', accountType: 'USER_AVAILABLE', balance: 50 }],
    });

    // Populate User C (0 Mala)
    usersDb.set(userC.userId, {
      id: userC.userId,
      username: 'user_c',
      role: 'USER',
      status: 'ACTIVE',
      profile: { displayName: 'Chetan Traveler' },
    });
    walletsDb.set('w-c', {
      id: 'w-c',
      userId: userC.userId,
      balance: 0,
      totalSent: 0,
      totalReceived: 0,
      status: 'ACTIVE',
      user: usersDb.get(userC.userId),
      ledgerAccounts: [{ id: 'acc-c', accountType: 'USER_AVAILABLE', balance: 0 }],
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    walletController = moduleRef.get<WalletController>(WalletController);
  });

  describe('1. Individual Account Dashboard Access', () => {
    it('User A can access User A wallet dashboard with accurate balance', async () => {
      const dashboardA = await walletController.getDashboard(userA);
      expect(dashboardA.balance).toBe(100);
      expect(dashboardA.username).toBe('user_a');
    });

    it('User B can access User B wallet dashboard with accurate balance', async () => {
      const dashboardB = await walletController.getDashboard(userB);
      expect(dashboardB.balance).toBe(50);
      expect(dashboardB.username).toBe('user_b');
    });
  });

  describe('2. Mala Transfer Workflow: User A sends 10 Mala to User B', () => {
    let transferReceiptId: string;

    it('Step 1: User A verifies recipient preview before sending', async () => {
      const preview = await walletController.verifyRecipient(userA, {
        identifier: 'user_b',
        amount: 10,
      });

      expect(preview.recipient.username).toBe('user_b');
      expect(preview.currentBalance).toBe(100);
      expect(preview.remainingBalance).toBe(90);
      expect(preview.canAfford).toBe(true);
    });

    it('Step 2: User A executes transfer of 10 Mala to User B', async () => {
      const receipt = await walletController.sendMala(userA, {
        recipientIdentifier: 'user_b',
        amount: 10,
        note: 'Sacred Tuesday Sadhana offering',
      });

      expect(receipt.amount).toBe(10);
      expect(receipt.status).toBe('COMPLETED');
      expect(receipt.sender.remainingBalance).toBe(90);
      expect(receipt.recipient.newBalance).toBe(60);
      transferReceiptId = receipt.receiptId;

      // Verify wallet state
      expect(walletsDb.get('w-a').balance).toBe(90);
      expect(walletsDb.get('w-b').balance).toBe(60);

      // Verify double-entry ledger bookkeeping (DEBIT == CREDIT)
      const txEntries = entriesDb.filter((e) => e.transactionId === transferReceiptId);
      expect(txEntries.length).toBe(2);
      const debitEntry = txEntries.find((e) => e.entryType === 'DEBIT');
      const creditEntry = txEntries.find((e) => e.entryType === 'CREDIT');
      expect(debitEntry.amount).toBe(10);
      expect(creditEntry.amount).toBe(10);
      expect(debitEntry.amount).toBe(creditEntry.amount);
    });

    it('Step 3: User C must NEVER be able to view User A / User B transaction details (User Isolation)', async () => {
      await expect(
        walletController.getTransactionDetail(userC, transferReceiptId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Step 4: Both User A and User B can access their transaction receipt', async () => {
      const receiptForA = await walletController.getTransactionDetail(userA, transferReceiptId);
      expect(receiptForA.id).toBe(transferReceiptId);
      expect(receiptForA.direction).toBe('SENT');

      const receiptForB = await walletController.getTransactionDetail(userB, transferReceiptId);
      expect(receiptForB.id).toBe(transferReceiptId);
      expect(receiptForB.direction).toBe('RECEIVED');
    });
  });

  describe('3. Reverse Transfer: User B sends 5 Mala back to User A', () => {
    it('User B sends 5 Mala to User A; both balances update correctly', async () => {
      const receipt = await walletController.sendMala(userB, {
        recipientIdentifier: 'user_a',
        amount: 5,
        note: 'Divine prasad return',
      });

      expect(receipt.amount).toBe(5);
      expect(receipt.status).toBe('COMPLETED');
      expect(receipt.sender.remainingBalance).toBe(55);
      expect(receipt.recipient.newBalance).toBe(95);

      expect(walletsDb.get('w-b').balance).toBe(55);
      expect(walletsDb.get('w-a').balance).toBe(95);
    });
  });

  describe('4. Insufficient Balance & Overdraft Prevention', () => {
    it('User C with balance 0 attempting to transfer 1 Mala must be rejected', async () => {
      await expect(
        walletController.sendMala(userC, {
          recipientIdentifier: 'user_a',
          amount: 1,
        }),
      ).rejects.toThrow(BadRequestException);

      // Verify balances are untouched
      expect(walletsDb.get('w-c').balance).toBe(0);
      expect(walletsDb.get('w-a').balance).toBe(95);
    });
  });
});
