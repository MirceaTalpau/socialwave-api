export class Notification {
  id: number;
  message: string;
  read: boolean;
  userId: number;
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
