import { Request, Response } from "express";
import { ComplaintService } from "../services/complaint.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError, HttpStatus } from "../errors/AppError";

export const createComplaint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaint = await ComplaintService.createComplaint(
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Complaint created successfully",
    complaint,
  });
});

export const getMyComplaints = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaints = await ComplaintService.getMyComplaints(req.user.id);

  res.status(200).json({
    success: true,
    complaints,
  });
});

export const getComplaintById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaint = await ComplaintService.getComplaintById(
    req.params.id as string,
    req.user
  );

  res.status(200).json({
    success: true,
    complaint,
  });
});

export const approveComplaint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaint = await ComplaintService.approveComplaint(
    req.params.id as string,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Complaint approved successfully",
    complaint,
  });
});

export const rejectComplaint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const complaint = await ComplaintService.rejectComplaint(
    req.params.id as string,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Complaint rejected successfully",
    complaint,
  });
});

export const getAssignedComplaints =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      if (!req.user) {
        throw new AppError(
          "Unauthorized",
          HttpStatus.UNAUTHORIZED
        );
      }

      const complaints =
        await ComplaintService
          .getAssignedComplaints(
            req.user
          );

      res.status(200).json({
        success: true,
        complaints,
      });
    }
  );

export const getUnassignedComplaints = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const complaints =
      await ComplaintService.getUnassignedComplaints();

    res.status(200).json({
      success: true,
      complaints,
    });
  }
);

export const startWork = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const complaint =
      await ComplaintService.startWork(
        req.params.id as string,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Work started successfully",
      complaint,
    });
  }
);

export const resolveComplaint = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const complaint =
      await ComplaintService.resolveComplaint(
        req.params.id as string,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Complaint resolved successfully",
      complaint,
    });
  }
);

export const deleteComplaint = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    await ComplaintService.deleteComplaint(
      req.params.id as string,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  }
);

export const addComment = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const comment =
      await ComplaintService.addComment(
        req.params.id as string,
        req.user,
        req.body.content
      );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  }
);

export const getComments = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED
      );
    }

    const comments =
      await ComplaintService.getComments(
        req.params.id as string,
        req.user
      );

    res.status(200).json({
      success: true,
      comments,
    });
  }
);