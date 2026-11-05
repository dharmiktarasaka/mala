import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService, UpgradeSubscriptionDto } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions & Premium Membership')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user subscription tier and unlocked features' })
  async getCurrent(@CurrentUser() user: RequestUser) {
    return this.subscriptionsService.getCurrentSubscription(user.userId);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate IAP receipt and upgrade to Premium' })
  async upgrade(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgradeToPremium(user.userId, dto);
  }
}

