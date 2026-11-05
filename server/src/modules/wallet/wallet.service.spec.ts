import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('WalletService (User Isolation & Transaction Security)', () => {
  let service: WalletService;
  let prisma: any;
  let ledgerService: any;

  beforeEach(async () => {
    prisma = {
      wallet: {
        findUnique: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
      ledgerTransaction: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    ledgerService = {
      executeTransfer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prisma },
        { provide: LedgerService, useValue: ledgerService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User Isolation Guard on Transactions', () => {
    it('should throw ForbiddenException if User C attempts to view a transaction between User A and User B', async () => {
      // Transaction between User A and User B
      prisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-a-to-b',
        sourceWallet: { userId: 'user-a-id', user: { username: 'user_a' } },
        targetWallet: { userId: 'user-b-id', user: { username: 'user_b' } },
        entries: [],
      });

      // User C requests details
      await expect(
        service.getTransactionDetail('user-c-id', 'tx-a-to-b'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow User A (sender) to view transaction details', async () => {
      prisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-a-to-b',
        sourceWalletId: 'wallet-a',
        targetWalletId: 'wallet-b',
        amount: 10,
        sourceWallet: { id: 'wallet-a', userId: 'user-a-id', user: { username: 'user_a' } },
        targetWallet: { id: 'wallet-b', userId: 'user-b-id', user: { username: 'user_b' } },
        entries: [],
      });

      prisma.wallet.findUnique.mockResolvedValue({ id: 'wallet-a', userId: 'user-a-id' });

      const detail = await service.getTransactionDetail('user-a-id', 'tx-a-to-b');
      expect(detail.id).toBe('tx-a-to-b');
      expect(detail.direction).toBe('SENT');
    });

    it('should allow User B (recipient) to view transaction details', async () => {
      prisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-a-to-b',
        sourceWalletId: 'wallet-a',
        targetWalletId: 'wallet-b',
        amount: 10,
        sourceWallet: { id: 'wallet-a', userId: 'user-a-id', user: { username: 'user_a' } },
        targetWallet: { id: 'wallet-b', userId: 'user-b-id', user: { username: 'user_b' } },
        entries: [],
      });

      prisma.wallet.findUnique.mockResolvedValue({ id: 'wallet-b', userId: 'user-b-id' });

      const detail = await service.getTransactionDetail('user-b-id', 'tx-a-to-b');
      expect(detail.id).toBe('tx-a-to-b');
      expect(detail.direction).toBe('RECEIVED');
    });
  });
});

