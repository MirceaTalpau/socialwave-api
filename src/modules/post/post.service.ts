import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { CreatePostDto } from './dtos/create-post.dto';
import { imagesPostTable, postsTable, videosPostTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { FileUploadService } from '../fileupload/fileupload.service';
import { Post } from 'src/entities/post.entity';
import { ImagePost } from 'src/entities/image-post.entity';
import { VideoPost } from 'src/entities/video-post.entity';

@Injectable()
export class PostService {
  private readonly db;
  constructor(private readonly fileUploadService: FileUploadService) {
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
      const newPost = new Post();
      newPost.userId = createPostDto.userId;
      newPost.description = createPostDto.description;
      newPost.createdAt = createPostDto.createdAt;
      newPost.updatedAt = createPostDto.updatedAt;
      const insertedPost = await this.db
        .insert(postsTable)
        .values(newPost)
        .returning()
        .execute();
      if (createPostDto.images) {
        await Promise.all(
          createPostDto.images.map(async (image) => {
            const { key, url } = await this.fileUploadService.uploadSingleFile({
              file: image,
              isPublic: true,
            });
            const insertImage = new ImagePost();
            insertImage.postId = insertedPost[0].postId;
            insertImage.imageUrl = url;
            await this.db.insert(imagesPostTable).values(insertImage).execute();
          }),
        );
      }
      if (createPostDto.videos) {
        await Promise.all(
          createPostDto.videos.map(async (video) => {
            const { key, url } = await this.fileUploadService.uploadSingleFile({
              file: video,
              isPublic: true,
            });
            const insertVideo = new VideoPost();
            insertVideo.postId = insertedPost[0].postId;
            insertVideo.videoUrl = url;
            await this.db.insert(videosPostTable).values(insertVideo).execute();
          }),
        );
      }
      console.log('insertedPost', insertedPost[0].postId);
    } catch (e) {
      throw e;
    }
  }
  async findOne(postId: number) {
    try {
      const post = new Post();
      const rawPost = await this.db
        .select()
        .from(postsTable)
        .where(eq(postsTable.postId, postId))
        .execute();
      if (!rawPost.length) {
        throw new Error('Post not found');
      }
      post.postId = rawPost[0].postId;
      post.userId = rawPost[0].userId;
      post.description = rawPost[0].description;
      post.createdAt = rawPost[0].createdAt;
      post.updatedAt = rawPost[0].updatedAt;
      const images = await this.db
        .select()
        .from(imagesPostTable)
        .where(eq(imagesPostTable.postId, postId))
        .execute();
      post.images = images.map((image) => {
        const newImage = new ImagePost();
        newImage.imagePostId = image.imagePostId;
        newImage.postId = image.postId;
        newImage.imageUrl = image.imageUrl;
        return newImage;
      });
      const videos = await this.db
        .select()
        .from(videosPostTable)
        .where(eq(videosPostTable.postId, postId))
        .execute();
      post.videos = videos.map((video) => {
        const newVideo = new VideoPost();
        newVideo.videoPostId = video.videoPostId;
        newVideo.postId = video.postId;
        newVideo.videoUrl = video.videoUrl;
        return newVideo;
      });
      return post;
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
