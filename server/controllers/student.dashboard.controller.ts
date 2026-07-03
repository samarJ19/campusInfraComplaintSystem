import { AppError, HttpStatus } from "../errors/AppError";
import { StudentDashboardService } from "../services/student.dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getStudentDashboard = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const dashboard = await StudentDashboardService.getDashboard(req.user);

  res.status(200).json({
    success: true,
    dashboard,
  });
});
