export class CreateStoryDto {
  userId?: number;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date = new Date();
}
