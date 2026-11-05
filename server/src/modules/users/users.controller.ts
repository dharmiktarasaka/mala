import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdatePrivacySettingsDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('User Profile & Privacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile, wallet & stats' })
  async getMyProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.getMyProfile(user.userId);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update profile details (name, bio, language, theme)' })
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Put('me/privacy')
  @ApiOperation({ summary: 'Update privacy settings (wallet/mala count visibility)' })
  async updatePrivacy(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    return this.usersService.updatePrivacySettings(user.userId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or display name' })
  @ApiQuery({ name: 'q', required: true })
  async searchUsers(
    @CurrentUser() user: RequestUser,
    @Query('q') q: string,
  ) {
    return this.usersService.searchUsers(q || '', user.userId);
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get public profile for a user' })
  async getPublicProfile(
    @CurrentUser() user: RequestUser,
    @Param('identifier') identifier: string,
  ) {
    return this.usersService.getPublicProfile(user.userId, identifier);
  }
}

