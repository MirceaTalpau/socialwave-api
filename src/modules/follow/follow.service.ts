import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { RequestFollowDto } from './dtos/request-follow.dto';
import { followRequestsTable, usersTable } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import { FollowRequest } from 'src/entities/follow-request.entity';
import { FollowResponseDto } from './dtos/follow-response.dto';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dtos/CreateNotification.dto';
@Injectable()
export class FollowService {
  private readonly db;
  constructor(private readonly notificationService: NotificationService) {
    this.db = drizzle(process.env.DATABASE_URL);
  }

  async getFollowStatus(followRequest: RequestFollowDto) {
    if (followRequest.followerId === followRequest.followeeId) {
      return { message: 'You cannot follow yourself!' };
    }
    const follow = await this.db
      .select()
      .from(followRequestsTable)
      .where(
        and(
          eq(followRequestsTable.followerId, followRequest.followerId),
          eq(followRequestsTable.followeeId, followRequest.followeeId),
          eq(followRequestsTable.isAccepted, true),
        ),
      );

    if (follow.length > 0) {
      return { message: 'Following' };
    }
    const followRequestExists = await this.db
      .select()
      .from(followRequestsTable)
      .where(
        and(
          eq(followRequestsTable.followerId, followRequest.followerId),
          eq(followRequestsTable.followeeId, followRequest.followeeId),
        ),
      );
    if (followRequestExists.length > 0) {
      return { message: 'Follow request sent' };
    }
    return { message: 'Not following' };
  }

  async getFollowers(userId: number) {
    try {
      const followers: FollowResponseDto[] = await this.db
        .select({
          userId: usersTable.userId,
          name: usersTable.name,
          email: usersTable.email,
          profilePicture: usersTable.profilePicture,
          createdAt: followRequestsTable.createdAt,
          updatedAt: followRequestsTable.updatedAt,
          isAccepted: followRequestsTable.isAccepted,
        })
        .from(followRequestsTable)
        .innerJoin(
          usersTable,
          eq(followRequestsTable.followerId, usersTable.userId),
        )
        .where(
          and(
            eq(followRequestsTable.followeeId, userId),
            eq(followRequestsTable.isAccepted, true),
          ),
        );
      return followers;
    } catch (error) {
      throw error;
    }
  }

  async getFollowing(userId: number) {
    try {
      const following: FollowResponseDto[] = await this.db
        .select({
          userId: usersTable.userId,
          name: usersTable.name,
          email: usersTable.email,
          profilePicture: usersTable.profilePicture,
          createdAt: followRequestsTable.createdAt,
          updatedAt: followRequestsTable.updatedAt,
          isAccepted: followRequestsTable.isAccepted,
        })
        .from(followRequestsTable)
        .innerJoin(
          usersTable,
          eq(followRequestsTable.followeeId, usersTable.userId),
        )
        .where(
          and(
            eq(followRequestsTable.followerId, userId),
            eq(followRequestsTable.isAccepted, true),
          ),
        );
      return following;
    } catch (error) {
      throw error;
    }
  }

  async getFollowRequests(userId: number) {
    try {
      const followRequests = await this.db
        .select({
          userId: usersTable.userId,
          name: usersTable.name,
          email: usersTable.email,
          profilePicture: usersTable.profilePicture,
          createdAt: followRequestsTable.createdAt,
          updatedAt: followRequestsTable.updatedAt,
          isAccepted: followRequestsTable.isAccepted,
        })
        .from(followRequestsTable)
        .innerJoin(
          usersTable,
          eq(followRequestsTable.followerId, usersTable.userId),
        )
        .where(
          and(
            eq(followRequestsTable.followeeId, userId),
            eq(followRequestsTable.isAccepted, false),
          ),
        );
      return followRequests;
    } catch (error) {
      throw error;
    }
  }
  async requestFollow(followRequest: RequestFollowDto) {
    try {
      if (followRequest.followerId === followRequest.followeeId) {
        return { message: 'Cannot follow yourself' };
      }
      const follow = new FollowRequest();
      follow.followerId = followRequest.followerId;
      follow.followeeId = followRequest.followeeId;
      follow.createdAt = new Date();

      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, follow.followerId),
            eq(followRequestsTable.followeeId, follow.followeeId),
          ),
        );
      if (followRequestExists.length > 0) {
        return { message: 'Follow request already sent' };
      }
      const notification = new CreateNotificationDto();
      notification.text = 'Follow request sent';
      notification.userId = followRequest.followeeId;
      notification.type = 'follow';
      notification.createdAt = new Date();
      notification.updatedAt = new Date();
      await this.notificationService.createNotification(notification);
      await this.db.insert(followRequestsTable).values(follow).execute();
      return { message: 'Follow request sent' };
    } catch (error) {
      throw error;
    }
  }
  async acceptFollow(followRequest: RequestFollowDto) {
    try {
      if (followRequest.followerId === followRequest.followeeId) {
        return { message: 'Cannot follow yourself' };
      }
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, false),
          ),
        );
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      if (followRequestExists[0].isAccepted) {
        return { message: 'Follow request already accepted' };
      }
      await this.db
        .update(followRequestsTable)
        .set({ isAccepted: true, updatedAt: new Date() })
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, false),
          ),
        )
        .execute();
      return { message: 'Follow request accepted' };
    } catch (error) {
      throw error;
    }
  }

  async rejectFollow(followRequest: RequestFollowDto) {
    try {
      if (followRequest.followerId === followRequest.followeeId) {
        return { message: 'Cannot follow yourself' };
      }
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
          ),
        );
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .delete(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
          ),
        )
        .execute();
      return { message: 'Follow request rejected' };
    } catch (error) {
      throw error;
    }
  }

  async unfollow(followRequest: RequestFollowDto) {
    try {
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, true),
          ),
        );
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .delete(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, true),
          ),
        )
        .execute();
      return { message: 'Unfollowed' };
    } catch (error) {
      throw error;
    }
  }

  async deleteFollowRequest(followRequest: RequestFollowDto) {
    try {
      const followRequestExists = await this.db
        .select()
        .from(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, false),
          ),
        );
      if (followRequestExists.length == 0) {
        return { message: 'Follow request not found' };
      }
      await this.db
        .delete(followRequestsTable)
        .where(
          and(
            eq(followRequestsTable.followerId, followRequest.followerId),
            eq(followRequestsTable.followeeId, followRequest.followeeId),
            eq(followRequestsTable.isAccepted, false),
          ),
        );
      return { message: 'Follow request deleted' };
    } catch (error) {
      throw error;
    }
  }
}
