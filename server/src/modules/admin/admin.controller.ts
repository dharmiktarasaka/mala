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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserStatus } from '@prisma/client';

@ApiTags('Administrator Control Panel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get complete platform-wide analytics and system health' })
  async getAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List and filter registered users' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', enum: UserStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(
    @Query('q') q?: string,
    @Query('status') status?: UserStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers(
      q,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend, ban or restore user with mandatory audit reason' })
  async updateUserStatus(
    @CurrentUser() admin: RequestUser,
    @Param('id') targetUserId: string,
    @Body('status') status: UserStatus,
    @Body('reason') reason: string,
  ) {
    return this.adminService.updateUserStatus(
      admin.userId,
      targetUserId,
      status,
      reason,
    );
  }

  @Get('ledger/reconcile/:walletId')
  @ApiOperation({ summary: 'Reconcile wallet balance against double-entry ledger records' })
  async reconcileWallet(@Param('walletId') walletId: string) {
    return this.adminService.reconcileUserWallet(walletId);
  }

  @Post('ledger/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute audited exceptional ledger adjustment' })
  async executeAdjustment(
    @CurrentUser() admin: RequestUser,
    @Body('targetUserId') targetUserId: string,
    @Body('amount') amount: number,
    @Body('type') type: 'CREDIT' | 'DEBIT',
    @Body('reason') reason: string,
  ) {
    return this.adminService.executeAdminAdjustment(
      admin.userId,
      targetUserId,
      amount,
      type,
      reason,
    );
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View immutable administrative audit trail' })
  async listAuditLogs(@Query('limit') limit?: string) {
    return this.adminService.listAuditLogs(limit ? parseInt(limit, 10) : 50);
  }
}

