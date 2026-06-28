import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ActivityService } from "../services/activity.service";

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await ActivityService.getComplaintActivity(
    req.params.id as string,
  );

  res.status(200).json({
    success: true,

    activity,
  });
});
