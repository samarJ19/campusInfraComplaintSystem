import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";

import { AdminDashboardService } from "../services/admin.dashboard.servic";

export const getAdminDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const dashboard = await AdminDashboardService.getDashboard();

    res.status(200).json({
      success: true,

      dashboard,
    });
  },
);
