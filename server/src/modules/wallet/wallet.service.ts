import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { TransferMalaDto, VerifyRecipientDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  async getWalletDashboard(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Seed 108 starter Mala if uninitialized
    if (wallet.balance === 0 && (!wallet.totalEarned || wallet.totalEarned === 0) && (!wallet.totalSent || wallet.totalSent === 0)) {
      wallet.balance = 108;
      wallet.totalEarned = 108;
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: 108, totalEarned: 108 },
      });
    }

    const recentTransactions = await this.prisma.ledgerTransaction.findMany({
      where: {
        OR: [{ sourceWalletId: wallet.id }, { targetWalletId: wallet.id }],
      },
      include: {
        sourceWallet: { include: { user: { include: { profile: true } } } },
        targetWallet: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Generate unique QR code payload for receiving Mala
    const devoteeId = (wallet.user as any).devoteeId || wallet.user.id;
    const qrPayload = JSON.stringify({
      scheme: 'mala',
      action: 'receive',
      userId: wallet.userId,
      devoteeId,
      username: wallet.user.username,
      displayName: wallet.user.profile?.displayName,
    });

    return {
      walletId: wallet.id,
      balance: wallet.balance,
      totalReceived: wallet.totalReceived,
      totalSent: wallet.totalSent,
      totalEarned: wallet.totalEarned,
      status: wallet.status,
      username: wallet.user.username,
      displayName: wallet.user.profile?.displayName,
      devoteeId,
      qrPayload,
      recentTransactions: recentTransactions.map((tx) =>
        this.formatTransactionSummary(tx, wallet.id),
      ),
    };
  }

  async verifyRecipient(userId: string, dto: VerifyRecipientDto) {
    const senderWallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    const cleanId = dto.identifier.replace(/^[#@]/, '').trim();
    const recipient: any = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { devoteeId: cleanId },
          { username: cleanId.toLowerCase() },
          { phone: cleanId },
        ],
      } as any,
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (!recipient) {
      throw new NotFoundException(`Devotee with ID or username '${dto.identifier}' not found. Please verify the 6-digit Devotee Number or username.`);
    }

    if (recipient.id === userId || recipient.devoteeId === userId) {
      throw new BadRequestException('You cannot send Mala to yourself');
    }

    if (recipient.status !== 'ACTIVE') {
      throw new BadRequestException('Recipient account is not active');
    }

    const remainingBalance = senderWallet.balance - dto.amount;
    const canAfford = remainingBalance >= 0;

    return {
      recipient: {
        userId: recipient.id,
        devoteeId: recipient.devoteeId || recipient.id,
        username: recipient.username,
        displayName: recipient.profile?.displayName || recipient.username,
        avatarUrl: recipient.profile?.avatarUrl,
      },
      transferAmount: dto.amount,
      currentBalance: senderWallet.balance,
      remainingBalance,
      canAfford,
    };
  }

  async sendMala(userId: string, dto: TransferMalaDto) {
    return this.ledgerService.executeTransfer({
      senderUserId: userId,
      recipientIdentifier: dto.recipientIdentifier,
      amount: dto.amount,
      idempotencyKey: dto.idempotencyKey,
      referenceNote: dto.note,
    });
  }

  async getTransactionHistory(
    userId: string,
    filter: 'all' | 'sent' | 'received' = 'all',
    page = 1,
    limit = 20,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Seed 108 starter Mala if uninitialized
    if (wallet.balance === 0 && (!wallet.totalEarned || wallet.totalEarned === 0) && (!wallet.totalSent || wallet.totalSent === 0)) {
      wallet.balance = 108;
      wallet.totalEarned = 108;
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: 108, totalEarned: 108 },
      });
    }

    const whereClause: any = {};
    if (filter === 'sent') {
      whereClause.sourceWalletId = wallet.id;
    } else if (filter === 'received') {
      whereClause.targetWalletId = wallet.id;
    } else {
      whereClause.OR = [{ sourceWalletId: wallet.id }, { targetWalletId: wallet.id }];
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.ledgerTransaction.findMany({
        where: whereClause,
        include: {
          sourceWallet: { include: { user: { include: { profile: true } } } },
          targetWallet: { include: { user: { include: { profile: true } } } },
          entries: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ledgerTransaction.count({ where: whereClause }),
    ]);

    return {
      items: transactions.map((tx) => this.formatTransactionSummary(tx, wallet.id)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionDetail(userId: string, transactionId: string) {
    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: transactionId },
      include: {
        sourceWallet: { include: { user: { include: { profile: true } } } },
        targetWallet: { include: { user: { include: { profile: true } } } },
        entries: true,
      },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    // Critical Security Check: User isolation test ensures User C cannot read User A/B transactions
    const isParty =
      tx.sourceWallet?.userId === userId || tx.targetWallet?.userId === userId;

    if (!isParty) {
      throw new ForbiddenException('You do not have permission to view this transaction');
    }

    const myWallet = await this.prisma.wallet.findUnique({ where: { userId } });
    return {
      ...this.formatTransactionSummary(tx, myWallet?.id || ''),
      entries: tx.entries.map((e) => ({
        id: e.id,
        entryType: e.entryType,
        amount: e.amount,
        balanceAfter: e.balanceAfter,
        description: e.description,
        createdAt: e.createdAt,
      })),
    };
  }

  private formatTransactionSummary(tx: any, myWalletId: string) {
    const isDebit = tx.sourceWalletId === myWalletId;
    const isCredit = tx.targetWalletId === myWalletId;

    let direction: 'SENT' | 'RECEIVED' | 'SYSTEM' = 'SYSTEM';
    if (isDebit && isCredit) {
      direction = 'SYSTEM';
    } else if (isDebit) {
      direction = 'SENT';
    } else if (isCredit) {
      direction = 'RECEIVED';
    }

    return {
      id: tx.id,
      transactionType: tx.transactionType,
      status: tx.status,
      amount: tx.amount,
      direction,
      note: tx.referenceNote,
      createdAt: tx.createdAt,
      counterparty: direction === 'SENT'
        ? {
            userId: tx.targetWallet?.user?.id,
            username: tx.targetWallet?.user?.username,
            displayName: tx.targetWallet?.user?.profile?.displayName,
            avatarUrl: tx.targetWallet?.user?.profile?.avatarUrl,
          }
        : {
            userId: tx.sourceWallet?.user?.id,
            username: tx.sourceWallet?.user?.username,
            displayName: tx.sourceWallet?.user?.profile?.displayName,
            avatarUrl: tx.sourceWallet?.user?.profile?.avatarUrl,
          },
    };
  }
}

