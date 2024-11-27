import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Post {
  @IsNotEmpty()
  @IsNumber()
  postId: number;
  @IsNotEmpty()
  @IsNumber()
  userId: number;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  createdAt: Date;
  updatedAt: Date;
}
