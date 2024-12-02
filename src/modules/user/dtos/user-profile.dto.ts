import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/entities/post.entity';

export class UserProfileDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  bio: string;
  @ApiProperty()
  profilePicture: string;
  @ApiProperty()
  coverPicture: string;
  @ApiProperty()
  birthdate: Date;
  @ApiProperty()
  posts: Post[];
}
