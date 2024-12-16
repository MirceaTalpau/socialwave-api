import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as cron from 'node-cron';
import 'dotenv/config';
import { followRequestsTable, storyTable, usersTable } from 'src/db/schema';
import { and, eq, lt } from 'drizzle-orm';
import { FileUploadService } from '../fileupload/fileupload.service';
import { CreateStoryDto } from './dtos/CreateStory.dto';
@Injectable()
export class StoryService {
  private readonly db;
  constructor(private readonly fileUploadService: FileUploadService) {
    this.db = drizzle(process.env.DATABASE_URL);
    this.scheduleStoryCleanup();
  }

  private scheduleStoryCleanup() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      await this.cleanupExpiredStories();
    });
  }

  private async cleanupExpiredStories() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.db
      .delete(storyTable)
      .where(lt(storyTable.createdAt, twentyFourHoursAgo));
  }

  getMyStories(userId: number) {
    return this.db
      .select({
        storyId: storyTable.storyId,
        imageUrl: storyTable.imageUrl,
        videoUrl: storyTable.videoUrl,
        createdAt: storyTable.createdAt,
        userId: storyTable.userId,
        name: usersTable.name,
        profilePicture: usersTable.profilePicture,
      })
      .from(storyTable)
      .innerJoin(usersTable, eq(storyTable.userId, usersTable.userId))
      .where(eq(storyTable.userId, userId));
  }

  async getStoriesByUserId(userId: number) {
    return this.db
      .select({
        storyId: storyTable.storyId,
        imageUrl: storyTable.imageUrl,
        videoUrl: storyTable.videoUrl,
        createdAt: storyTable.createdAt,
        userId: storyTable.userId,
        name: usersTable.name,
        profilePicture: usersTable.profilePicture,
      })
      .from(storyTable)
      .innerJoin(
        followRequestsTable,
        eq(storyTable.userId, followRequestsTable.followeeId),
      )
      .innerJoin(usersTable, eq(storyTable.userId, usersTable.userId))
      .where(eq(followRequestsTable.followerId, userId));
  }

  async createStory(
    userId: number,
    image?: Express.Multer.File,
    video?: Express.Multer.File,
  ) {
    if (!image && !video) {
      throw new Error('An image or video must be provided');
    }
    try {
      const story = new CreateStoryDto();
      const imageUploadResult = image
        ? await this.fileUploadService.uploadSingleFile(image, true, {
            file: image,
            isPublic: true,
          })
        : null;
      const videoUploadResult = video
        ? await this.fileUploadService.uploadSingleFile(video, true, {
            file: video,
            isPublic: true,
          })
        : null;
      const imageUrl = imageUploadResult ? imageUploadResult.url : null;
      const videoUrl = videoUploadResult ? videoUploadResult.url : null;
      if (!imageUrl) {
        story.videoUrl = videoUrl;
        story.userId = userId;
        story.createdAt = new Date();
        await this.db.insert(storyTable).values(story);
        return { message: 'Story created successfully' };
      }
      if (!videoUrl) {
        console.log('Video URL:', imageUrl);
        story.imageUrl = imageUrl;
        story.userId = userId;
        story.createdAt = new Date();
        await this.db.insert(storyTable).values(story);
        return { message: 'Story created successfully' };
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async deleteStory(storyId: number, userId: number) {
    try {
      const story = await this.db
        .select()
        .from(storyTable)
        .where(
          and(eq(storyTable.storyId, storyId), eq(storyTable.userId, userId)),
        );
      if (story[0].imageUrl) {
        const imageKey = story[0].imageUrl.split('/').pop();
        await this.fileUploadService.deleteFile(imageKey);
      }
      if (story[0].videoUrl) {
        const videoKey = story[0].videoUrl.split('/').pop();
        await this.fileUploadService.deleteFile(videoKey);
      }
      return await this.db
        .delete(storyTable)
        .where(
          and(eq(storyTable.storyId, storyId), eq(storyTable.userId, userId)),
        );
    } catch (e) {
      throw e;
    }
  }
}
