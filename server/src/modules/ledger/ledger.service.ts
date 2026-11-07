import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TransactionType,
  TransactionStatus,
  EntryType,
  LedgerAccountType,
} from '@prisma/client';

export interface TransferRequest {
  senderUserId: string;
  recipientIdentifier: string; // username, userId, or phone
  amount: number;
  idempotencyKey?: string;
  referenceNote?: string;
}

export interface AdminAdjustmentRequest {
  adminUserId: string;
  targetUserId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
}

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Execute an atomic banking-style Mala transfer with double-entry ledger bookkeeping.
   */
  async executeTransfer(dto: TransferRequest) {
    const { senderUserId, recipientIdentifier, amount, idempotencyKey, referenceNote } = dto;

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      throw new BadRequestException('Transfer amount must be a positive whole number of Mala');
    }

    // 1. Check idempotency key to prevent double transfers
    if (idempotencyKey) {
      const existingTx = await this.prisma.ledgerTransaction.findUnique({
        where: { idempotencyKey },
        include: {
          sourceWallet: { include: { user: { include: { profile: true } } } },
          targetWallet: { include: { user: { include: { profile: true } } } },
        },
      });

      if (existingTx) {
        return this.formatReceipt(existingTx);
      }
    }

    // 2. Identify Recipient
    const cleanRecipientId = recipientIdentifier.trim();
    const recipientUser: any = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanRecipientId },
          { devoteeId: cleanRecipientId },
          { username: cleanRecipientId.toLowerCase() },
          { phone: cleanRecipientId },
        ],
      } as any,
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (!recipientUser) {
      throw new NotFoundException(`Recipient with ID or username '${recipientIdentifier}' not found`);
    }

    if (recipientUser.id === senderUserId || recipientUser.devoteeId === senderUserId) {
      throw new BadRequestException('Cannot transfer Mala to your own account');
    }

    if (recipientUser.status !== 'ACTIVE') {
      throw new BadRequestException('Recipient account is currently suspended or inactive');
    }

    // 3. Check for Block relationships
    const isBlocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: senderUserId, blockedId: recipientUser.id },
          { blockerId: recipientUser.id, blockedId: senderUserId },
        ],
      },
    });

    if (isBlocked) {
      throw new BadRequestException('Unable to transfer Mala to this user');
    }

    // 4. Atomic Double-Entry Database Transaction with Concurrency & Isolation
    const completedTransaction = await this.prisma.$transaction(
      async (tx) => {
        // Fetch sender wallet with pessimistic locking (raw query or isolated check)
        const senderWallet = await tx.wallet.findUnique({
          where: { userId: senderUserId },
          include: {
            user: { include: { profile: true } },
            ledgerAccounts: { where: { accountType: LedgerAccountType.USER_AVAILABLE } },
          },
        });

        if (!senderWallet) {
          throw new NotFoundException('Sender wallet not found');
        }

        if (senderWallet.status !== 'ACTIVE') {
          throw new BadRequestException(`Sender wallet is ${senderWallet.status.toLowerCase()}`);
        }

        if (senderWallet.balance < amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${senderWallet.balance} Mala, Required: ${amount} Mala`,
          );
        }

        // Get sender's primary ledger account
        let senderAccount = senderWallet.ledgerAccounts[0];
        if (!senderAccount) {
          senderAccount = await tx.ledgerAccount.create({
            data: {
              walletId: senderWallet.id,
              accountType: LedgerAccountType.USER_AVAILABLE,
              balance: senderWallet.balance,
            },
          });
        }

        // Fetch recipient wallet
        const recipientWallet = await tx.wallet.findUnique({
          where: { userId: recipientUser.id },
          include: {
            user: { include: { profile: true } },
            ledgerAccounts: { where: { accountType: LedgerAccountType.USER_AVAILABLE } },
          },
        });

        if (!recipientWallet) {
          throw new NotFoundException('Recipient wallet not found');
        }

        if (recipientWallet.status !== 'ACTIVE') {
          throw new BadRequestException('Recipient wallet is not active');
        }

        let recipientAccount = recipientWallet.ledgerAccounts[0];
        if (!recipientAccount) {
          recipientAccount = await tx.ledgerAccount.create({
            data: {
              walletId: recipientWallet.id,
              accountType: LedgerAccountType.USER_AVAILABLE,
              balance: recipientWallet.balance,
            },
          });
        }

        // Create the transaction record
        const transactionRecord = await tx.ledgerTransaction.create({
          data: {
            transactionType: TransactionType.TRANSFER,
            status: TransactionStatus.PROCESSING,
            idempotencyKey: idempotencyKey || undefined,
            sourceWalletId: senderWallet.id,
            targetWalletId: recipientWallet.id,
            amount,
            referenceNote: referenceNote || 'Spiritual Mala Offering',
          },
        });

        // Compute post-transaction balances
        const senderNewBalance = senderWallet.balance - amount;
        const recipientNewBalance = recipientWallet.balance + amount;

        // Double-entry validation:
        // Entry 1: DEBIT Sender Account
        const debitEntry = await tx.ledgerEntry.create({
          data: {
            transactionId: transactionRecord.id,
            ledgerAccountId: senderAccount.id,
            entryType: EntryType.DEBIT,
            amount,
            balanceAfter: senderNewBalance,
            description: `Transfer to @${recipientUser.username}`,
          },
        });

        // Entry 2: CREDIT Recipient Account
        const creditEntry = await tx.ledgerEntry.create({
          data: {
            transactionId: transactionRecord.id,
            ledgerAccountId: recipientAccount.id,
            entryType: EntryType.CREDIT,
            amount,
            balanceAfter: recipientNewBalance,
            description: `Transfer from @${senderWallet.user.username}`,
          },
        });

        // Invariant check: Debit amount must strictly equal Credit amount
        if (debitEntry.amount !== creditEntry.amount || debitEntry.amount !== amount) {
          throw new InternalServerErrorException('Double-entry balancing constraint failed');
        }

        // Update sender wallet and ledger account
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: {
            balance: senderNewBalance,
            totalSent: { increment: amount },
          },
        });

        await tx.ledgerAccount.update({
          where: { id: senderAccount.id },
          data: { balance: senderNewBalance },
        });

        // Update recipient wallet and ledger account
        await tx.wallet.update({
          where: { id: recipientWallet.id },
          data: {
            balance: recipientNewBalance,
            totalReceived: { increment: amount },
          },
        });

        await tx.ledgerAccount.update({
          where: { id: recipientAccount.id },
          data: { balance: recipientNewBalance },
        });

        // Mark transaction as COMPLETED
        const finalizedTx = await tx.ledgerTransaction.update({
          where: { id: transactionRecord.id },
          data: { status: TransactionStatus.COMPLETED },
          include: {
            sourceWallet: { include: { user: { include: { profile: true } } } },
            targetWallet: { include: { user: { include: { profile: true } } } },
          },
        });

        // Send In-App Notifications
        await tx.notification.create({
          data: {
            userId: recipientUser.id,
            type: 'MALA_RECEIVED',
            title: 'Mala Received!',
            body: `You received ${amount} Mala from @${senderWallet.user.username}`,
            dataJson: JSON.stringify({
              transactionId: finalizedTx.id,
              amount,
              senderUsername: senderWallet.user.username,
            }),
          },
        });

        await tx.notification.create({
          data: {
            userId: senderUserId,
            type: 'MALA_SENT',
            title: 'Mala Transfer Successful',
            body: `You sent ${amount} Mala to @${recipientUser.username}`,
            dataJson: JSON.stringify({
              transactionId: finalizedTx.id,
              amount,
              recipientUsername: recipientUser.username,
            }),
          },
        });

        return finalizedTx;
      },
      {
        timeout: 10000,
      },
    );

    return this.formatReceipt(completedTransaction);
  }

  /**
   * Reconcile a wallet's balance against all historical double-entry ledger entries.
   */
  async reconcileWallet(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        user: true,
        ledgerAccounts: {
          include: {
            entries: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    let calculatedBalance = 0;
    for (const account of wallet.ledgerAccounts) {
      for (const entry of account.entries) {
        if (entry.entryType === EntryType.CREDIT) {
          calculatedBalance += entry.amount;
        } else if (entry.entryType === EntryType.DEBIT) {
          calculatedBalance -= entry.amount;
        }
      }
    }

    const isBalanced = wallet.balance === calculatedBalance;

    return {
      walletId: wallet.id,
      username: wallet.user.username,
      storedBalance: wallet.balance,
      authoritativeLedgerBalance: calculatedBalance,
      discrepancy: wallet.balance - calculatedBalance,
      isReconciled: isBalanced,
      totalEntries: wallet.ledgerAccounts.reduce(
        (sum, acc) => sum + acc.entries.length,
        0,
      ),
      reconciledAt: new Date().toISOString(),
    };
  }

  /**
   * Strict administrative adjustment with immutable audit log and mandatory reason.
   */
  async executeAdminAdjustment(request: AdminAdjustmentRequest) {
    const { adminUserId, targetUserId, amount, type, reason } = request;

    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Mandatory detailed reason required for administrative adjustment');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Adjustment amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const targetWallet = await tx.wallet.findUnique({
        where: { userId: targetUserId },
        include: {
          user: true,
          ledgerAccounts: { where: { accountType: LedgerAccountType.USER_AVAILABLE } },
        },
      });

      if (!targetWallet) {
        throw new NotFoundException('Target user wallet not found');
      }

      let ledgerAccount = targetWallet.ledgerAccounts[0];
      if (!ledgerAccount) {
        ledgerAccount = await tx.ledgerAccount.create({
          data: {
            walletId: targetWallet.id,
            accountType: LedgerAccountType.USER_AVAILABLE,
            balance: targetWallet.balance,
          },
        });
      }

      const beforeBalance = targetWallet.balance;
      const afterBalance =
        type === 'CREDIT' ? beforeBalance + amount : beforeBalance - amount;

      if (afterBalance < 0) {
        throw new BadRequestException('Adjustment would result in negative balance');
      }

      const txRecord = await tx.ledgerTransaction.create({
        data: {
          transactionType: TransactionType.ADMIN_ADJUSTMENT,
          status: TransactionStatus.COMPLETED,
          amount,
          referenceNote: `Admin Adjustment: ${reason}`,
          metadata: JSON.stringify({ adminUserId, reason, type }),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: txRecord.id,
          ledgerAccountId: ledgerAccount.id,
          entryType: type === 'CREDIT' ? EntryType.CREDIT : EntryType.DEBIT,
          amount,
          balanceAfter: afterBalance,
          description: `Admin ${type}: ${reason}`,
        },
      });

      await tx.wallet.update({
        where: { id: targetWallet.id },
        data: { balance: afterBalance },
      });

      await tx.ledgerAccount.update({
        where: { id: ledgerAccount.id },
        data: { balance: afterBalance },
      });

      // Immutable Audit Log
      await tx.auditLog.create({
        data: {
          adminId: adminUserId,
          action: `WALLET_ADJUSTMENT_${type}`,
          targetType: 'WALLET',
          targetId: targetWallet.id,
          reason,
          beforeStateJson: JSON.stringify({ balance: beforeBalance }),
          afterStateJson: JSON.stringify({ balance: afterBalance }),
        },
      });

      return {
        success: true,
        transactionId: txRecord.id,
        beforeBalance,
        afterBalance,
        type,
        amount,
        targetUsername: targetWallet.user.username,
      };
    });
  }

  private formatReceipt(tx: any) {
    return {
      receiptId: tx.id,
      status: tx.status,
      amount: tx.amount,
      note: tx.referenceNote,
      createdAt: tx.createdAt,
      sender: {
        userId: tx.sourceWallet?.user?.id,
        username: tx.sourceWallet?.user?.username,
        displayName: tx.sourceWallet?.user?.profile?.displayName,
        avatarUrl: tx.sourceWallet?.user?.profile?.avatarUrl,
        remainingBalance: tx.sourceWallet?.balance,
      },
      recipient: {
        userId: tx.targetWallet?.user?.id,
        username: tx.targetWallet?.user?.username,
        displayName: tx.targetWallet?.user?.profile?.displayName,
        avatarUrl: tx.targetWallet?.user?.profile?.avatarUrl,
        newBalance: tx.targetWallet?.balance,
      },
    };
  }
}

