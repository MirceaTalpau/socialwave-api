import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
