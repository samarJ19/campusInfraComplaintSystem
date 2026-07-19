import { Request, Response } from "express";

import { UploadService } from "../services/upload.service";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError, HttpStatus } from "../errors/AppError";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("Image is required", HttpStatus.BAD_REQUEST);
  }

  const imageUrl = await UploadService.uploadImage(req.file);

  res.status(201).json({
    success: true,

    message: "Image uploaded successfully",

    imageUrl,
  });
});
