import { NotificationType } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";
import { prismaClient } from "../prisma/client";
import { SocketService } from "../socket/socket.service";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  complaintId?: string;
}

export class NotificationService {
  static async createNotification(
    data: CreateNotificationInput,
    tx: Prisma.TransactionClient = prismaClient,
  ) {
    const notification = await tx.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        complaintId: data.complaintId,
      },
    });

    return notification;
  }

  static async getNotifications(userId: string) {
    return prismaClient.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prismaClient.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return prismaClient.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
