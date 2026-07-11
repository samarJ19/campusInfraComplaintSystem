import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";

import { MaintenanceDashboardService } from "../services/maintenance.dashboard.service";

export const getMaintenanceDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const dashboard = await MaintenanceDashboardService.getDashboard(req.user);

    res.status(200).json({
      success: true,

      dashboard,
    });
  },
);
