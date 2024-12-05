export class FollowResponseDto {
  followerId: number;
  followeeId: number;
  createdAt: Date;
  isAccepted: boolean;
  updatedAt: Date;
  followerProfilePic: string;
  followerUsername: string;
}
