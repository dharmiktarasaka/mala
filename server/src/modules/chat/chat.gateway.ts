import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (client.handshake.query?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'mala-super-secure-jwt-secret-key-2026',
      });

      client.data.user = payload;
      this.userSocketMap.set(payload.sub, client.id);
      client.join(`user:${payload.sub}`);
      this.logger.log(`Devotee connected: ${payload.username} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user?.sub) {
      this.userSocketMap.delete(user.sub);
      this.logger.log(`Devotee disconnected: ${user.username}`);
    }
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.join(`conv:${data.conversationId}`);
    }
  }

  @SubscribeMessage('leave:conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.leave(`conv:${data.conversationId}`);
    }
  }

  @SubscribeMessage('send:message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const sender = client.data.user;
    if (!sender) return;

    try {
      const message = await this.chatService.sendMessage(sender.sub, dto);

      // Broadcast to specific conversation room
      this.server.to(`conv:${message.conversationId}`).emit('new:message', message);

      // Also deliver to recipient's personal channel in case they aren't on this chat screen
      this.server.to(`user:${message.receiverId}`).emit('message:alert', {
        conversationId: message.conversationId,
        message,
      });

      return { success: true, message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const sender = client.data.user;
    if (!sender || !data.conversationId) return;

    client.to(`conv:${data.conversationId}`).emit('devotee:typing', {
      conversationId: data.conversationId,
      userId: sender.sub,
      username: sender.username,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const sender = client.data.user;
    if (!sender || !data.conversationId) return;

    client.to(`conv:${data.conversationId}`).emit('devotee:typing', {
      conversationId: data.conversationId,
      userId: sender.sub,
      username: sender.username,
      isTyping: false,
    });
  }
}

