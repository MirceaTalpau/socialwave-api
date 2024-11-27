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
      // Ensure `createdAt` is a valid Date
      if (!(createPostDto.createdAt instanceof Date)) {
        createPostDto.createdAt = new Date(createPostDto.createdAt);
      }

      // Ensure `updatedAt` is a valid Date or set it to the current time
      if (!createPostDto.updatedAt) {
        createPostDto.updatedAt = new Date();
      } else if (!(createPostDto.updatedAt instanceof Date)) {
        createPostDto.updatedAt = new Date(createPostDto.updatedAt);
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

  async deletePost(postId: number) {
    try {
      return await this.db
        .delete(postsTable)
        .where(eq(postsTable.postId, postId))
        .execute();
    } catch (e) {
      throw e;
    }
  }
}
