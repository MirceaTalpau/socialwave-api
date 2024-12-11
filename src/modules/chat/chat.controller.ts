import { ChatService } from './chat.service';
import { Body, Controller, Get, Post, Req, Query } from '@nestjs/common';
import { CreateChatDto } from './dtos/CreateChat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getChats(@Req() req) {
    const user = req.user;
    return await this.chatService.getChatsByUserId(user);
  }
  @Post()
  async createChat(@Req() req, @Body() user: { userId: number }) {
    const currentUser = req.user;
    const chat = new CreateChatDto();
    chat.user1Id = currentUser;
    chat.user2Id = user.userId;
    return await this.chatService.createChat(chat);
  }

  @Get('messages')
  async getChatMessages(@Req() req, @Query() chat: { chatId: number }) {
    const user = req.user;
    return await this.chatService.getMessages(user, chat.chatId);
  }
}
