import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;
export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true, default: 0, min: 0 })
  balance: number;

  @Prop({ default: 0 })
  lockedBalance: number;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'FROZEN', 'LOCKED'] })
  status: string;

  @Prop({ default: 0 })
  totalCounted: number;

  @Prop({ default: 0 })
  totalReceived: number;

  @Prop({ default: 0 })
  totalSent: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

@Schema({ timestamps: true })
export class LedgerEntry extends Document {
  @Prop({ required: true, index: true })
  transactionId: string;

  @Prop({ required: true, index: true })
  walletId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['DEBIT', 'CREDIT'] })
  entryType: string;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true })
  balanceAfter: number;

  @Prop({ required: true, enum: ['TRANSFER', 'REWARD', 'DEPOSIT', 'ADMIN_ADJUSTMENT'] })
  transactionType: string;

  @Prop()
  counterpartyUserId?: string;

  @Prop()
  counterpartyUsername?: string;

  @Prop()
  note?: string;

  @Prop({ unique: true, sparse: true })
  idempotencyKey?: string;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);
LedgerEntrySchema.index({ userId: 1, createdAt: -1 });

