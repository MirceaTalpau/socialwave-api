import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsInt()
  @IsNotEmpty()
  commentId: number;
  @IsString()
  @IsNotEmpty()
  text: string;
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
