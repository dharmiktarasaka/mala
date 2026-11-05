import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CounterModule } from './modules/counter/counter.module';
import { FriendsModule } from './modules/friends/friends.module';
import { FeedModule } from './modules/feed/feed.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    LedgerModule,
    WalletModule,
    CounterModule,
    FriendsModule,
    FeedModule,
    ChatModule,
    NotificationsModule,
    AchievementsModule,
    SubscriptionsModule,
    AdminModule,
  ],
})
export class AppModule {}

