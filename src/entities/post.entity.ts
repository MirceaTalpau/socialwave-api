import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ImagePost } from './image-post.entity';
import { VideoPost } from './video-post.entity';

export class Post {
  @IsNotEmpty()
  @IsNumber()
  postId: number;
  @IsNotEmpty()
  @IsNumber()
  userId: number;
  profilePicture: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  createdAt: Date;
  updatedAt: Date;
  images: ImagePost[];
  videos: VideoPost[];
}
