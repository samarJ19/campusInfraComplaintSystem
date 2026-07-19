import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

import { AppError, HttpStatus } from "../errors/AppError";

export class UploadService {
  static async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new AppError("Image is required", HttpStatus.BAD_REQUEST);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "campus-issue-management",

          resource_type: "image",

          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },

        (error, result) => {
          if (error || !result) {
            reject(
              new AppError(
                "Image upload failed",
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );

            return;
          }

          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
