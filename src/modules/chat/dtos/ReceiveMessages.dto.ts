import { Message } from 'src/entities/message.entity';

export class ReceiveMessagesDto {
  messages: Message[];
  page: number;
  hasMore: boolean;
}
