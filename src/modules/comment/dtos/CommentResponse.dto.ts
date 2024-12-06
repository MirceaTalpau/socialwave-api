export class CommentResponseDto {
  commentId: number;
  parentId: number;
  postId: number;
  userId: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}
