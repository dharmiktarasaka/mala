import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionStatus, EntryType, LedgerAccountType } from '@prisma/client';

describe('LedgerService (Double-Entry Ledger Engine)', () => {
  let service: LedgerService;
  let prisma: any;

  const mockSenderWallet = {
    id: 'wallet-a',
    userId: 'user-a-id',
    balance: 100,
    totalSent: 0,
    totalReceived: 0,
    status: 'ACTIVE',
    user: { id: 'user-a-id', username: 'user_a', profile: { displayName: 'User A' } },
    ledgerAccounts: [
      { id: 'acc-a', walletId: 'wallet-a', accountType: LedgerAccountType.USER_AVAILABLE, balance: 100 },
    ],
  };

  const mockRecipientWallet = {
    id: 'wallet-b',
    userId: 'user-b-id',
    balance: 50,
    totalSent: 0,
    totalReceived: 0,
    status: 'ACTIVE',
    user: { id: 'user-b-id', username: 'user_b', profile: { displayName: 'User B' } },
    ledgerAccounts: [
      { id: 'acc-b', walletId: 'wallet-b', accountType: LedgerAccountType.USER_AVAILABLE, balance: 50 },
    ],
  };

  beforeEach(async () => {
    prisma = {
      ledgerTransaction: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      blockedUser: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      wallet: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ledgerAccount: {
        create: jest.fn(),
        update: jest.fn(),
      },
      ledgerEntry: {
        create: jest.fn(),
      },
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validation & Invariants', () => {
    it('should reject non-positive amounts (e.g. 0 or negative)', async () => {
      await expect(
        service.executeTransfer({
          senderUserId: 'user-a-id',
          recipientIdentifier: 'user_b',
          amount: 0,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.executeTransfer({
          senderUserId: 'user-a-id',
          recipientIdentifier: 'user_b',
          amount: -10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject fractional amounts (Mala must be whole units)', async () => {
      await expect(
        service.executeTransfer({
          senderUserId: 'user-a-id',
          recipientIdentifier: 'user_b',
          amount: 10.5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transfers to oneself', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-a-id',
        username: 'user_a',
        status: 'ACTIVE',
      });

      await expect(
        service.executeTransfer({
          senderUserId: 'user-a-id',
          recipientIdentifier: 'user_a',
          amount: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent overdraft when sender balance is insufficient', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-b-id',
        username: 'user_b',
        status: 'ACTIVE',
      });

      // Sender has 5 Mala, wants to send 50
      const poorSender = { ...mockSenderWallet, balance: 5 };
      prisma.wallet.findUnique.mockResolvedValueOnce(poorSender);

      await expect(
        service.executeTransfer({
          senderUserId: 'user-a-id',
          recipientIdentifier: 'user_b',
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Double-Entry Bookkeeping & Transfer Execution', () => {
    it('should execute a valid transfer and create balanced DEBIT and CREDIT entries', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-b-id',
        username: 'user_b',
        status: 'ACTIVE',
      });

      prisma.wallet.findUnique
        .mockResolvedValueOnce(mockSenderWallet) // in tx: sender
        .mockResolvedValueOnce(mockRecipientWallet); // in tx: recipient

      const mockTxRecord = {
        id: 'tx-12345',
        transactionType: 'TRANSFER',
        status: 'PROCESSING',
        amount: 10,
        referenceNote: 'Spiritual Mala Offering',
      };
      prisma.ledgerTransaction.create.mockResolvedValue(mockTxRecord);

      prisma.ledgerEntry.create
        .mockResolvedValueOnce({
          id: 'entry-debit',
          entryType: EntryType.DEBIT,
          amount: 10,
          balanceAfter: 90,
        })
        .mockResolvedValueOnce({
          id: 'entry-credit',
          entryType: EntryType.CREDIT,
          amount: 10,
          balanceAfter: 60,
        });

      const finalizedTx = {
        ...mockTxRecord,
        status: TransactionStatus.COMPLETED,
        createdAt: new Date(),
        sourceWallet: {
          ...mockSenderWallet,
          balance: 90,
        },
        targetWallet: {
          ...mockRecipientWallet,
          balance: 60,
        },
      };
      prisma.ledgerTransaction.update.mockResolvedValue(finalizedTx);

      const receipt = await service.executeTransfer({
        senderUserId: 'user-a-id',
        recipientIdentifier: 'user_b',
        amount: 10,
        referenceNote: 'Morning Sadhana Sharing',
      });

      expect(receipt.status).toBe(TransactionStatus.COMPLETED);
      expect(receipt.amount).toBe(10);
      expect(receipt.sender.remainingBalance).toBe(90);
      expect(receipt.recipient.newBalance).toBe(60);

      // Verify wallet updates were called
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-a' },
        data: { balance: 90, totalSent: { increment: 10 } },
      });

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-b' },
        data: { balance: 60, totalReceived: { increment: 10 } },
      });

      // Verify double-entry creation
      expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(2);
    });

    it('should return existing receipt when idempotency key is repeated', async () => {
      const existingTx = {
        id: 'tx-idempotent',
        status: TransactionStatus.COMPLETED,
        amount: 25,
        referenceNote: 'Idempotent test',
        createdAt: new Date(),
        sourceWallet: mockSenderWallet,
        targetWallet: mockRecipientWallet,
      };

      prisma.ledgerTransaction.findUnique.mockResolvedValue(existingTx);

      const receipt = await service.executeTransfer({
        senderUserId: 'user-a-id',
        recipientIdentifier: 'user_b',
        amount: 25,
        idempotencyKey: 'dup-key-123',
      });

      expect(receipt.receiptId).toBe('tx-idempotent');
      expect(prisma.ledgerTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('Ledger Reconciliation', () => {
    it('should reconcile wallet when sum of entries matches stored balance', async () => {
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-a',
        balance: 100,
        user: { username: 'user_a' },
        ledgerAccounts: [
          {
            entries: [
              { entryType: EntryType.CREDIT, amount: 150 },
              { entryType: EntryType.DEBIT, amount: 50 },
            ],
          },
        ],
      });

      const result = await service.reconcileWallet('wallet-a');
      expect(result.storedBalance).toBe(100);
      expect(result.authoritativeLedgerBalance).toBe(100);
      expect(result.isReconciled).toBe(true);
      expect(result.discrepancy).toBe(0);
    });
  });
});

