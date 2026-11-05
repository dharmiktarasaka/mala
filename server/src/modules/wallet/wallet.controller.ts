import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TransferMalaDto, VerifyRecipientDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Digital Mala Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get current user wallet balance and recent activity' })
  async getDashboard(@CurrentUser() user: RequestUser) {
    return this.walletService.getWalletDashboard(user.userId);
  }

  @Post('verify-recipient')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify recipient and calculate remaining balance preview' })
  async verifyRecipient(
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyRecipientDto,
  ) {
    return this.walletService.verifyRecipient(user.userId, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send Mala to another user via banking-style double-entry transaction' })
  async sendMala(
    @CurrentUser() user: RequestUser,
    @Body() dto: TransferMalaDto,
  ) {
    return this.walletService.sendMala(user.userId, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated transaction history' })
  @ApiQuery({ name: 'filter', enum: ['all', 'sent', 'received'], required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTransactions(
    @CurrentUser() user: RequestUser,
    @Query('filter') filter?: 'all' | 'sent' | 'received',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactionHistory(
      user.userId,
      filter || 'all',
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get detailed transaction receipt' })
  async getTransactionDetail(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.walletService.getTransactionDetail(user.userId, id);
  }
}

