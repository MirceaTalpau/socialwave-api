import { ChatService } from './chat.service';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
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
  async createChat(@Req() req, @Body() chat: CreateChatDto) {
    const user = req.user;
    chat.user2Id = user;
    return await this.chatService.createChat(chat);
  }
}
