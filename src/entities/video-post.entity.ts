import { IsNotEmpty, IsNumber } from 'class-validator';

export class VideoPost {
  @IsNotEmpty()
  @IsNumber()
  videoPostId: number;
  @IsNotEmpty()
  @IsNumber()
  postId: number;
  @IsNotEmpty()
  videoUrl: string;
}
