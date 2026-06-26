import { Router } from "express";
import { Role } from "../generated/prisma/enums";

import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  approveComplaint,
  rejectComplaint,
} from "../controllers/complaint.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* ---------------- Student ---------------- */

router.post(
  "/",
  authenticate,
  authorize(Role.STUDENT),
  createComplaint
);

router.get(
  "/my",
  authenticate,
  authorize(Role.STUDENT),
  getMyComplaints
);

/* ---------------- Shared ---------------- */

router.get(
  "/:id",
  authenticate,
  getComplaintById
);

/* ---------------- Faculty ---------------- */

router.patch(
  "/:id/approve",
  authenticate,
  authorize(Role.FACULTY),
  approveComplaint
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(Role.FACULTY),
  rejectComplaint
);

export default router;