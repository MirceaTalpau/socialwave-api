import { PostService } from './../post/post.service';
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { followRequestsTable, postsTable, usersTable } from 'src/db/schema';
import { and, desc, eq, or } from 'drizzle-orm';
import { FeedResponseDto } from './dtos/FeedResponse.dto';

@Injectable()
export class FeedService {
  private readonly db;
  constructor(private readonly PostService: PostService) {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFeed(userId: number, page: number) {
    // const descriptions = [
    //   'Test description 1',
    //   'Another test description',
    //   'Random post content',
    //   'Sample text for testing',
    //   'Lorem ipsum placeholder',
    //   'A quick brown fox',
    //   'Hello world',
    //   'This is a test',
    //   'Just another post',
    //   'Description for testing',
    // ];

    // for (let i = 0; i < 100; i++) {
    //   const randomUserId = Math.floor(Math.random() * 3) + 1; // Random userId between 1 and 3
    //   const randomDate = new Date(2024, 0, 1 + Math.random() * 365); // Random date in 2024
    //   const randomDescription =
    //     descriptions[Math.floor(Math.random() * descriptions.length)]; // Random description

    //   await this.db
    //     .insert(postsTable)
    //     .values({
    //       userId: randomUserId,
    //       createdAt: randomDate,
    //       description: randomDescription,
    //       images: ['test'],
    //       videos: ['test'],
    //     })
    //     .execute();
    // }
    const posts = await this.db
      .select({
        postId: postsTable.postId,
      })
      .from(postsTable)
      .innerJoin(
        followRequestsTable,
        eq(postsTable.userId, followRequestsTable.followeeId),
      )
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.userId))

      .where(
        or(
          eq(postsTable.userId, userId), // Include user's own posts
          and(
            eq(followRequestsTable.followerId, userId), // Posts from followed users
            eq(followRequestsTable.isAccepted, true), // Follow request must be accepted
          ),
        ),
      )
      .orderBy(desc(postsTable.createdAt))
      .limit(10)
      .offset(10 * page);

    const feed: FeedResponseDto[] = [];
    for (const post of posts) {
      const postFeed = await this.PostService.findOne(post.postId);
      feed.push(postFeed);
    }
    feed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return feed;
  }
}
