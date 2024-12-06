import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  parentId: number;
  @IsInt()
  @IsNotEmpty()
  postId: number;
  @IsInt()
  userId?: number;
  @IsString()
  @IsNotEmpty()
  text: string;
}
