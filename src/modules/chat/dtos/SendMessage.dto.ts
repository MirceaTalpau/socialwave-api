export class SendMessageDto {
  senderId: number;
  receiverId: number;
  chatId: number;
  text: string;
  createdAt: Date;
}
