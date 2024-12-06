import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  commentId: number;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;
  @IsInt()
  userId: number;
}
