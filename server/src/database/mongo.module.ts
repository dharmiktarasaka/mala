import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MongoService } from './mongo.service';
import {
  User,
  UserSchema,
  Wallet,
  WalletSchema,
  LedgerEntry,
  LedgerEntrySchema,
  CounterSession,
  CounterSessionSchema,
  Post,
  PostSchema,
  Comment,
  CommentSchema,
  Conversation,
  ConversationSchema,
  Message,
  MessageSchema,
  Notification,
  NotificationSchema,
} from './schemas';

const schemaDefinitions = [
  { name: User.name, schema: UserSchema },
  { name: Wallet.name, schema: WalletSchema },
  { name: LedgerEntry.name, schema: LedgerEntrySchema },
  { name: CounterSession.name, schema: CounterSessionSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Conversation.name, schema: ConversationSchema },
  { name: Message.name, schema: MessageSchema },
  { name: Notification.name, schema: NotificationSchema },
];

const modelProviders = schemaDefinitions.map((def) => ({
  provide: getModelToken(def.name),
  useFactory: () => mongoose.models[def.name] || mongoose.model(def.name, def.schema),
}));

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MongoService, ...modelProviders],
  exports: [MongoService, ...modelProviders],
})
export class MongoModule {}
