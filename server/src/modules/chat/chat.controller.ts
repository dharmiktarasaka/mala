import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Private Devotee Chat & Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all active 1-to-1 conversations' })
  async getConversations(@CurrentUser() user: RequestUser) {
    return this.chatService.getConversations(user.userId);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get message history for conversation with authorization' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @CurrentUser() user: RequestUser,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      user.userId,
      conversationId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send message to a devotee via HTTP REST fallback' })
  async sendMessage(
    @CurrentUser() user: RequestUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.userId, dto);
  }
}

