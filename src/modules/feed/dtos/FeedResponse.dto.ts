import { CommentResponseDto } from 'src/modules/comment/dtos/CommentResponse.dto';

export class FeedResponseDto {
  userId: number;
  postId: number;
  name: string;
  profilePicture: string;
  createdAt: Date;
  description: string;
  images: string[];
  videos: string[];
  comments: CommentResponseDto[];
}
