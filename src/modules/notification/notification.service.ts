import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { CreateNotificationDto } from './dtos/CreateNotification.dto';
import { notificationsTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class NotificationService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async createNotification(data: CreateNotificationDto) {
    return this.db.insert(notificationsTable).values(data);
  }

  async getNotifications(userId: number) {
    return this.db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId));
  }

  async markAsRead(notificationId: number) {
    return this.db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.notificationId, notificationId));
  }
}
