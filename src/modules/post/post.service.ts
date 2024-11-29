import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { CreatePostDto } from './dtos/create-post.dto';
import {
  imagesPostTable,
  postsTable,
  usersTable,
  videosPostTable,
} from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { FileUploadService } from '../fileupload/fileupload.service';
import { Post } from 'src/entities/post.entity';
import { ImagePost } from 'src/entities/image-post.entity';
import { VideoPost } from 'src/entities/video-post.entity';
import * as path from 'path';

@Injectable()
export class PostService {
  private readonly db;
  constructor(private readonly fileUploadService: FileUploadService) {
    this.db = drizzle(process.env.DATABASE_URL);
  }
  async createPost(createPostDto: CreatePostDto) {
    try {
      await this.db.transaction(async (tx) => {
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
        const insertedPost = await tx
          .insert(postsTable)
          .values(newPost)
          .returning()
          .execute();
        if (createPostDto.images) {
          await Promise.all(
            createPostDto.images.map(async (image) => {
              const { key, url } =
                await this.fileUploadService.uploadSingleFile({
                  file: image,
                  isPublic: true,
                });
              console.log('key', key);
              const insertImage = new ImagePost();
              insertImage.postId = insertedPost[0].postId;
              insertImage.imageUrl = url;
              await tx.insert(imagesPostTable).values(insertImage).execute();
            }),
          );
        }
        if (createPostDto.videos) {
          await Promise.all(
            createPostDto.videos.map(async (video) => {
              // Define a temporary file path
              const videoPath = path.join(
                __dirname,
                '..',
                'uploads',
                video.originalname,
              );

              // Write the video buffer to a file
              fs.writeFileSync(videoPath, video.buffer);
              console.log(`Video saved at: ${videoPath}`);

              const outputPath = path.join(
                __dirname,
                '..',
                'uploads',
                'compressed',
                video.originalname,
              );
              // Use a promise wrapper for the video compression
              try {
                await this.fileUploadService.compressVideo(
                  videoPath,
                  outputPath,
                );
                console.log(videoPath, outputPath);
                const { key, url } =
                  await this.fileUploadService.uploadSingleFile({
                    file: {
                      ...video,
                      path: outputPath,
                    },
                    isPublic: true,
                  });
                // Delete the video file from disk after upload
                fs.unlink(outputPath, (err) => {
                  if (err) {
                    console.error(`Failed to delete file: ${outputPath}`, err);
                  } else {
                    console.log(`Successfully deleted file: ${outputPath}`);
                  }
                });
                fs.unlink(videoPath, (err) => {
                  if (err) {
                    console.error(`Failed to delete file: ${videoPath}`, err);
                  } else {
                    console.log(`Successfully deleted file: ${videoPath}`);
                  }
                });
                const insertVideo = new VideoPost();
                insertVideo.postId = insertedPost[0].postId;
                insertVideo.videoUrl = url;
                await tx.insert(videosPostTable).values(insertVideo).execute();
              } catch (err) {
                console.error('Error during video upload process:', err);
                throw new Error(err);
              }
            }),
          );
        }
        return {
          message: 'Post created successfully',
          postId: insertedPost[0].postId,
        };
      });
    } catch (e) {
      console.error('Error creating post::::::', e);
      throw new BadRequestException(e.message);
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
      console.log('rawPost', rawPost);

      const user = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, rawPost[0].userId))
        .execute();
      console.log('user', user);
      if (!user.length) {
        throw new Error('User not found');
      }
      post.profilePicture = user[0].profilePicture;
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
      const posts = new Array<Post>();
      const rawPosts = await this.db
        .select()
        .from(postsTable)
        .where(eq(postsTable.userId, userId))
        .execute();
      if (!rawPosts.length) {
        throw new Error('No posts found');
      }
      await Promise.all(
        rawPosts.map(async (rawPost) => {
          const post = new Post();
          const user = await this.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.userId, userId))
            .execute();
          if (!user.length) {
            throw new Error('User not found');
          }
          post.postId = rawPost.postId;
          post.userId = rawPost.userId;
          post.description = rawPost.description;
          post.createdAt = rawPost.createdAt;
          post.updatedAt = rawPost.updatedAt;
          const images = await this.db
            .select()
            .from(imagesPostTable)
            .where(eq(imagesPostTable.postId, rawPost.postId))
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
            .where(eq(videosPostTable.postId, rawPost.postId))
            .execute();
          post.videos = videos.map((video) => {
            const newVideo = new VideoPost();
            newVideo.videoPostId = video.videoPostId;
            newVideo.postId = video.postId;
            newVideo.videoUrl = video.videoUrl;
            return newVideo;
          });
          posts.push(post);
        }),
      );
      return posts;
    } catch (e) {
      throw e;
    }
  }

  async deletePost(postId: number) {
    try {
      const post = await this.db
        .select()
        .from(postsTable)
        .where(eq(postsTable.postId, postId))
        .execute();
      if (!post.length) {
        throw new BadRequestException('Post not found');
      }
      const images = await this.db
        .select()
        .from(imagesPostTable)
        .where(eq(imagesPostTable.postId, postId))
        .execute();
      await Promise.all(
        images.map(async (image) => {
          await this.db
            .delete(imagesPostTable)
            .where(eq(imagesPostTable.imagePostId, image.imagePostId))
            .execute();
          const imageKey = image.imageUrl.split('/').pop();
          // console.log('imageKey', imageKey);
          await this.fileUploadService.deleteFile(imageKey);
        }),
      );
      const videos = await this.db
        .select()
        .from(videosPostTable)
        .where(eq(videosPostTable.postId, postId))
        .execute();
      await Promise.all(
        videos.map(async (video) => {
          await this.db
            .delete(videosPostTable)
            .where(eq(videosPostTable.videoPostId, video.videoPostId))
            .execute();
          const videoKey = video.videoUrl.split('/').pop();
          // console.log('videoKey', videoKey);
          await this.fileUploadService.deleteFile(videoKey);
        }),
      );
      await this.db
        .delete(postsTable)
        .where(eq(postsTable.postId, postId))
        .execute();
      return { message: 'Post deleted successfully' };
    } catch (e) {
      throw e;
    }
  }
}
