import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { CreateCommentDto } from './dtos/CreateComment.dto';
import { commentsTable } from 'src/db/schema';
import { Comment } from 'src/entities/comment.entity';
import { and, eq } from 'drizzle-orm';
import { UpdateCommentDto } from './dtos/UpdateComment.dto';
@Injectable()
export class CommentService {
  private readonly db;
  constructor() {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async createComment(comment: CreateCommentDto) {
    try {
      const newComment = new Comment();
      newComment.parentId = comment.parentId;
      newComment.postId = comment.postId;
      newComment.userId = comment.userId;
      newComment.text = comment.text;
      newComment.createdAt = new Date();
      return await this.db.insert(commentsTable).values(newComment);
    } catch (error) {
      throw error;
    }
  }

  async getCommentsByPostId(postId: number) {
    try {
      return await this.db
        .select()
        .from(commentsTable)
        .where(eq(commentsTable.postId, postId));
    } catch (error) {
      throw error;
    }
  }
  async updateComment(comment: UpdateCommentDto) {
    try {
      return await this.db
        .update(commentsTable)
        .set({
          text: comment.text,
        })
        .where(
          and(
            eq(commentsTable.commentId, comment.commentId),
            eq(commentsTable.userId, comment.userId),
          ),
        );
    } catch (error) {
      throw error;
    }
  }
  async deleteComment(commentId: number, userId: number) {
    try {
      return await this.db
        .delete(commentsTable)
        .where(
          and(
            eq(commentsTable.commentId, commentId),
            eq(commentsTable.userId, userId),
          ),
        );
    } catch (error) {
      throw error;
    }
  }
}
