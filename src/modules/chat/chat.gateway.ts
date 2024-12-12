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
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    {
      chatId,
      senderId,
      receiverId,
    }: { chatId: number; senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`chat_${chatId}`).emit('receiveTyping', {
      chatId,
      senderId,
      receiverId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody()
    {
      chatId,
      senderId,
      receiverId,
    }: { chatId: number; senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`chat_${chatId}`).emit('receiveStopTyping', {
      chatId,
      senderId,
      receiverId,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    message: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Message received:', message);
    const savedMessage = await this.chatService.saveMessage(message);
    this.server
      .to(`chat_${message.chatId}`)
      .emit('receiveMessage', savedMessage);
    return savedMessage;
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() { chatId, userId }: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Join the user to the room
    client.join(`chat_${chatId}`);
    const page = 0;
    const messages = await this.chatService.getMessages(userId, chatId, page);
    console.log(messages);
    client.emit('receiveMessages', messages);
    console.log(`User ${userId} joined room chat_${chatId}`);
  }
}
