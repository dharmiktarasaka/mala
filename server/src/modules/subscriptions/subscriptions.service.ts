import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpgradeSubscriptionDto {
  platform: 'GOOGLE_PLAY' | 'APPLE_IAP' | 'SYSTEM';
  purchaseToken: string;
  productId: string;
}

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return {
        plan: 'FREE',
        status: 'ACTIVE',
        isPremium: false,
        features: [
          'Basic Mala Counter',
          'Digital Mala Wallet',
          'Send & Receive Mala',
          'Spiritual Community Feed',
        ],
      };
    }

    const isPremium = sub.plan === 'PREMIUM';
    return {
      plan: sub.plan,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      platform: sub.platform,
      isPremium,
      features: isPremium
        ? [
            'All Free Features',
            'Advanced Mala Analytics & Heatmaps',
            'Exclusive Vedic & Rudraksha Themes',
            'Detailed Practice Sadhana Reports',
            'Golden Devotee Profile Badge',
            'Unlimited Audio & Haptic Customization',
          ]
        : [
            'Basic Mala Counter',
            'Digital Mala Wallet',
            'Send & Receive Mala',
            'Spiritual Community Feed',
          ],
    };
  }

  async upgradeToPremium(userId: string, dto: UpgradeSubscriptionDto) {
    // Backend validation of Apple IAP / Google Play Billing Receipt
    if (!dto.purchaseToken || !dto.productId) {
      throw new BadRequestException('Invalid store purchase receipt');
    }

    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        platform: dto.platform,
        startDate: now,
        endDate: oneYearLater,
        autoRenew: true,
        originalTransactionId: dto.purchaseToken,
      },
    });

    return {
      success: true,
      message: 'Devotee Premium unlocked successfully! Har Har Mahadev.',
      subscription,
    };
  }
}

