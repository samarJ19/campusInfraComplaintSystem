import { Request, Response } from "express";

import { NotificationService } from "../services/notification.service";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const notifications = await NotificationService.getNotifications(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      notifications,
    });
  },
);

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const notification = await NotificationService.markAsRead(
    req.params.id as string,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const result = await NotificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.count,
    });
  },
);
