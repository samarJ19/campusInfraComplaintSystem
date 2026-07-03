import { Request, Response } from "express";

import { AssignmentService } from "../services/assignment.service";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";
import { Department } from "../generated/prisma/browser";

export const requestReassignment = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const request = await AssignmentService.requestReassignment(
      req.params.complaintId as string,
      req.user,
      req.body.reason,
    );

    res.status(201).json({
      success: true,
      message: "Reassignment requested successfully",
      request,
    });
  },
);

export const getPendingReassignments = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const requests = await AssignmentService.getPendingRequests(req.user);

    res.status(200).json({
      success: true,
      requests,
    });
  },
);

export const approveReassignment = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const complaint = await AssignmentService.approveReassignment(
      req.params.id as string,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Reassignment approved successfully",
      complaint,
    });
  },
);

export const rejectReassignment = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    const request = await AssignmentService.rejectReassignment(
      req.params.id as string,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Reassignment rejected successfully",
      request,
    });
  },
);

export const manualAssignComplaint = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaint = await AssignmentService.manualAssignComplaint(
    req.params.id as string,

    req.body.maintenanceId,

    req.user,
  );

  res.status(200).json({
    success: true,

    message: "Complaint assigned successfully",

    complaint,
  });
});

export const getAvailableMaintenanceStaff = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const staff =
      await AssignmentService.getAvailableMaintenanceStaff(
        req.params.department as Department,
        req.user
      );

    res.status(200).json({
      success: true,
      staff,
    });
  }
);
