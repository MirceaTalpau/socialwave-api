import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { likesTable, usersTable } from 'src/db/schema';

@Injectable()
export class LikeService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL!);
  }

  async likePost(userId: number, postId: number) {
    const like = await this.db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.postId, postId)));
    if (like.length > 0) {
      return { message: 'You have already liked this post' };
    }
    const date = new Date();
    await this.db.insert(likesTable).values({
      userId,
      postId,
      createdAt: date,
    });
    return { message: 'Post liked' };
  }

  async unlikePost(userId: number, postId: number) {
    await this.db
      .delete(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.postId, postId)));
    return { message: 'Post unliked' };
  }

  async getLikes(postId: number) {
    const likes = await this.db
      .select()
      .from(likesTable)
      .where(eq(likesTable.postId, postId));
    return likes;
  }

  async getLikesAndUsers(postId: number) {
    const likes = await this.db
      .select({
        userId: likesTable.userId,
        postId: likesTable.postId,
        name: usersTable.name,
        profilePicture: usersTable.profilePicture,
      })
      .from(likesTable)
      .innerJoin(usersTable, eq(likesTable.userId, usersTable.userId))
      .where(eq(likesTable.postId, postId));
    return likes;
  }

  async deleteAllByPostId(postId: number) {
    await this.db.delete(likesTable).where(eq(likesTable.postId, postId));
  }
}
