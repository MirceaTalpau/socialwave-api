import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { CreatePostDto } from './dtos/create-post.dto';
import { postsTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PostService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }
  async createPost(createPostDto: CreatePostDto) {
    try {
      if (!createPostDto.updatedAt) {
        createPostDto.updatedAt = new Date();
      }
      return await this.db.insert(postsTable).values(createPostDto).execute();
    } catch (e) {
      throw e;
    }
  }

  async findOne(postId: number) {
    try {
      return await this.db
        .select()
        .from(postsTable)
        .where(eq(postsTable.postId, postId))
        .execute();
    } catch (e) {
      throw e;
    }
  }
  async findAllByUser(userId: number) {
    try {
      return await this.db
        .select()
        .from(postsTable)
        .where(eq(postsTable.userId, userId))
        .execute();
    } catch (e) {
      throw e;
    }
  }
}
