export class Notification {
  id: number;
  text: string;
  read: boolean;
  userId: number;
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
