import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { SendMessageDto } from './dtos/SendMessage.dto';
import { messagesTable } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
@Injectable()
export class ChatService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async saveMessage(message: SendMessageDto) {
    const savedMessage = await this.db.messagesTable.insert({
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: new Date(),
    });
    return savedMessage;
  }

  async getMessages(senderId: number, receiverId: number) {
    this.db.messagesTable
      .update({ isRead: true })
      .where(
        and(
          eq(messagesTable.senderId, senderId),
          eq(messagesTable.receiverId, receiverId),
          eq(messagesTable.isRead, false),
        ),
      );
    const messages = await this.db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.senderId, senderId),
          eq(messagesTable.receiverId, receiverId),
        ),
      );
    return messages;
  }
}
