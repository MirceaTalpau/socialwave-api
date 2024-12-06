import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import {
  followRequestsTable,
  imagesPostTable,
  postsTable,
  usersTable,
  videosPostTable,
} from 'src/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { FeedResponseDto } from './dtos/FeedResponse.dto';

@Injectable()
export class FeedService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFeed(userId: number) {
    const posts = await this.db
      .select({
        userId: usersTable.userId,
        name: usersTable.name,
        profilePicture: usersTable.profilePicture,
        createdAt: postsTable.createdAt,
        description: postsTable.description,
        postId: postsTable.postId,
      })
      .from(postsTable)
      .innerJoin(
        followRequestsTable,
        eq(postsTable.userId, followRequestsTable.followeeId),
      )
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.userId))

      .where(
        and(eq(followRequestsTable.followerId, userId)),
        eq(followRequestsTable.isAccepted, true),
      )
      .orderBy(postsTable.createdAt, 'desc');
    const feed: FeedResponseDto[] = [];
    for (const post of posts) {
      const images = await this.db
        .select({
          images: imagesPostTable.imageUrl,
        })
        .from(imagesPostTable)
        .where(eq(imagesPostTable.postId, post.postId));
      const videos = await this.db
        .select({
          videos: videosPostTable.videoUrl,
        })
        .from(videosPostTable)
        .where(eq(videosPostTable.postId, post.postId));
      feed.push({
        userId: post.userId,
        postId: post.postId,
        name: post.name,
        profilePicture: post.profilePicture,
        createdAt: post.createdAt,
        description: post.description,
        images: images.map((image) => image.images),
        videos: videos.map((video) => video.videos),
      });
    }

    return feed;
  }
}
