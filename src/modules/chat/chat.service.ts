import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { SendMessageDto } from './dtos/SendMessage.dto';
import { chatTable, messagesTable } from 'src/db/schema';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { CreateChatDto } from './dtos/CreateChat.dto';
@Injectable()
export class ChatService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getChatsByUserId(userId: number) {
    // Query to fetch chats along with the last message
    const chatsWithLastMessage = await this.db
      .select({
        chatId: chatTable.chatId,
        user1Id: chatTable.user1Id,
        user2Id: chatTable.user2Id,
        chatCreatedAt: chatTable.createdAt,
        chatUpdatedAt: chatTable.updatedAt,
        lastMessage: sql<string>`m.text`, // Drizzle requires raw SQL for the subquery fields
        lastMessageAt: sql<Date>`m.created_at`,
      })
      .from(chatTable)
      .leftJoin(
        // Subquery to fetch the latest message for each chat
        sql<typeof messagesTable>`(
            SELECT "chatId", "text", "createdAt" 
            FROM ${messagesTable}
            ORDER BY "createdAt" DESC
            LIMIT 1
          )`.as('m'),
        eq(chatTable.chatId, sql<number>`m.chatId`),
      )
      .where(or(eq(chatTable.user1Id, userId), eq(chatTable.user2Id, userId)))
      .orderBy(desc(sql<Date>`m.created_at`));
    return chatsWithLastMessage;
  }

  async createChat(chat: CreateChatDto) {
    try {
      await this.db.insert(chatTable).values(chat);
      return { message: 'Chat created successfully' };
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(message: SendMessageDto) {
    const savedMessage = await this.db.messagesTable.insert({
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: new Date(),
      chatId: message.chatId,
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
