import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { followRequestsTable, postsTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class FeedService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFeed(userId: number) {
    const feed = await this.db
      .select()
      .from(postsTable)
      .innerJoin(
        followRequestsTable,
        eq(postsTable.userId, followRequestsTable.followeeId),
      )
      .where(eq(followRequestsTable.followerId, userId))
      .orderBy(postsTable.createdAt, 'desc');
    return feed;
  }
}
