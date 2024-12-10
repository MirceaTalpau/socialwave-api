import { PostService } from './../post/post.service';
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { followRequestsTable, postsTable, usersTable } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import { FeedResponseDto } from './dtos/FeedResponse.dto';

@Injectable()
export class FeedService {
  private readonly db;
  constructor(private readonly PostService: PostService) {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFeed(userId: number, page: number) {
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
      .orderBy(postsTable.createdAt, 'desc')
      .limit(10)
      .offset(10 * page);

    const feed: FeedResponseDto[] = [];
    for (const post of posts) {
      const postFeed = await this.PostService.findOne(post.postId);
      feed.push(postFeed);
    }

    return feed;
  }
}
