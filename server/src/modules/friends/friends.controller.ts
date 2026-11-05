import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Friends & Community Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active friends' })
  async getMyFriends(@CurrentUser() user: RequestUser) {
    return this.friendsService.getMyFriends(user.userId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending incoming and sent friend requests' })
  async getRequests(@CurrentUser() user: RequestUser) {
    return this.friendsService.getPendingRequests(user.userId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get suggested devotees to connect with' })
  async getSuggestions(@CurrentUser() user: RequestUser) {
    return this.friendsService.getSuggestions(user.userId);
  }

  @Post('request/:target')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a friend request by username or User ID' })
  async sendRequest(
    @CurrentUser() user: RequestUser,
    @Param('target') target: string,
  ) {
    return this.friendsService.sendFriendRequest(user.userId, target);
  }

  @Post('respond/:requestId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept, reject, or cancel a friend request' })
  async respondToRequest(
    @CurrentUser() user: RequestUser,
    @Param('requestId') requestId: string,
    @Body('action') action: 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
  ) {
    return this.friendsService.respondToRequest(user.userId, requestId, action);
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove a friend' })
  async removeFriend(
    @CurrentUser() user: RequestUser,
    @Param('friendId') friendId: string,
  ) {
    return this.friendsService.removeFriend(user.userId, friendId);
  }

  @Post('block/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(
    @CurrentUser() user: RequestUser,
    @Param('userId') targetUserId: string,
  ) {
    return this.friendsService.blockUser(user.userId, targetUserId);
  }

  @Delete('unblock/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(
    @CurrentUser() user: RequestUser,
    @Param('userId') targetUserId: string,
  ) {
    return this.friendsService.unblockUser(user.userId, targetUserId);
  }
}

