import { IsNotEmpty, IsNumber } from 'class-validator';

export class ImagePost {
  @IsNotEmpty()
  @IsNumber()
  imagePostId: number;
  @IsNotEmpty()
  @IsNumber()
  postId: number;
  @IsNotEmpty()
  imageUrl: string;
}
