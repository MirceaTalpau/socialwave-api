import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @ApiProperty()
  parentId?: number;
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  postId: number;
  @IsInt()
  userId?: number;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;
}
