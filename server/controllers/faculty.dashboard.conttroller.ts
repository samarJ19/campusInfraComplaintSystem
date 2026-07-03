import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";

import { FacultyDashboardService } from "../services/faculty.dashboard.service";

export const getFacultyDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const dashboard = await FacultyDashboardService.getDashboard(req.user);

    res.status(200).json({
      success: true,

      dashboard,
    });
  },
);
