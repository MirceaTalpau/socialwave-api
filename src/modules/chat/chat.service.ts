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
      const chatExists = await this.db
        .select()
        .from(chatTable)
        .where(
          or(
            and(
              eq(chatTable.user1Id, chat.user1Id),
              eq(chatTable.user2Id, chat.user2Id),
            ),
            and(
              eq(chatTable.user1Id, chat.user2Id),
              eq(chatTable.user2Id, chat.user1Id),
            ),
          ),
        );
      if (chatExists.length > 0) {
        return chatExists[0];
      }
      return await this.db
        .insert(chatTable)
        .values(chat)
        .returning({ chatId: chatTable.chatId });
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(message: SendMessageDto) {
    const savedMessage = await this.db
      .insert(messagesTable)
      .values({
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        createdAt: new Date(),
        chatId: message.chatId,
      })
      .returning({
        messageId: messagesTable.messageId,
        senderId: messagesTable.senderId,
        receiverId: messagesTable.receiverId,
        text: messagesTable.text,
        createdAt: messagesTable.createdAt,
        chatId: messagesTable.chatId,
      });
    return savedMessage;
  }

  async getMessages(senderId: number, receiverId: number) {
    const messages = this.db.messagesTable
      .update({ isRead: true })
      .where(
        and(
          eq(messagesTable.senderId, senderId),
          eq(messagesTable.receiverId, receiverId),
          eq(messagesTable.isRead, false),
        ),
      )
      .returning({
        messageId: messagesTable.messageId,
        senderId: messagesTable.senderId,
        receiverId: messagesTable.receiverId,
        text: messagesTable.text,
        createdAt: messagesTable.createdAt,
      });
    return messages;
  }
}
