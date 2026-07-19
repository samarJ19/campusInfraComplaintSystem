import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { upload } from "../middleware/upload.middleware";

import { uploadImage } from "../controllers/upload.controller";
import { Role } from "../generated/prisma/browser";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",

  authenticate,
  authorize(Role.STUDENT, Role.ADMIN, Role.FACULTY),

  upload.single("image"),

  uploadImage,
);

export default router;
