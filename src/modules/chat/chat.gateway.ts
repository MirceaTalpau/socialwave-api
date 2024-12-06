import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dtos/SendMessage.dto';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    message: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage = await this.chatService.saveMessage(message);
    this.server
      .to(`user_${message.receiverId}`)
      .emit('receiveMessage', savedMessage);
    return savedMessage;
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  }
}
