import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { SendMessageDto } from './dtos/SendMessage.dto';
import { chatTable, messagesTable, usersTable } from 'src/db/schema';
import { and, desc, eq, or } from 'drizzle-orm';
import { CreateChatDto } from './dtos/CreateChat.dto';
@Injectable()
export class ChatService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }
  async getChatsByUserId(userId: number) {
    const chats = await this.db
      .select({
        chatId: chatTable.chatId,
        user1Id: chatTable.user1Id,
        user2Id: chatTable.user2Id,
      })
      .from(chatTable)
      .where(or(eq(chatTable.user1Id, userId), eq(chatTable.user2Id, userId)));

    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        // Determine the other user in the chat
        const otherUserId =
          chat.user1Id === userId ? chat.user2Id : chat.user1Id;

        // Fetch the last message for the chat
        const lastMessage = await this.db
          .select({
            messageId: messagesTable.messageId,
            senderId: messagesTable.senderId,
            receiverId: messagesTable.receiverId,
            text: messagesTable.text,
            createdAt: messagesTable.createdAt,
          })
          .from(messagesTable)
          .where(eq(messagesTable.chatId, chat.chatId))
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        // Fetch the profile picture of the other user
        const otherUser = await this.db
          .select({
            userId: usersTable.userId,
            profilePicture: usersTable.profilePicture,
          })
          .from(usersTable)
          .where(eq(usersTable.userId, otherUserId))
          .limit(1);

        // Check if a last message exists
        const lastMessageData = lastMessage[0] || null;

        return {
          ...chat,
          lastMessage: lastMessageData
            ? {
                text: lastMessageData.text,
                createdAt: lastMessageData.createdAt,
                senderId: lastMessageData.senderId,
                sentByUser:
                  lastMessageData.senderId === userId ? 'You' : 'Other',
              }
            : null,
          otherUser: otherUser[0] || null, // Include the other user's profile picture and ID
        };
      }),
    );

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
      chat.createdAt = new Date();
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
