import { Router } from "express";
import { Role } from "../generated/prisma/enums";

import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  approveComplaint,
  rejectComplaint,
  deleteComplaint,
  getComments,
  addComment,
  resolveComplaint,
  startWork,
  getAssignedComplaints,
  getUnassignedComplaints,
} from "../controllers/complaint.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* ---------------- Student ---------------- */

router.post("/", authenticate, authorize(Role.STUDENT), createComplaint);

router.get("/my", authenticate, authorize(Role.STUDENT), getMyComplaints);

router.delete("/:id", authenticate, deleteComplaint);

/* ---------------- Shared ---------------- */

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/unassigned",
  authenticate,
  authorize(Role.ADMIN),
  getUnassignedComplaints
);

router.get("/:id", authenticate, getComplaintById);

router.post("/:id/comments", authenticate, addComment);

router.get("/:id/comments", authenticate, getComments);

router.get(
  "/assigned",
  authenticate,
  authorize(Role.MAINTENANCE, Role.ADMIN),
  getAssignedComplaints,
);

/* ---------------- Faculty ---------------- */

router.patch("/:id/approve", authenticate, approveComplaint);

router.patch("/:id/reject", authenticate, rejectComplaint);

/*
|--------------------------------------------------------------------------
| Maintenance
|--------------------------------------------------------------------------
*/

router.patch("/:id/start", authenticate, startWork);

router.patch("/:id/resolve", authenticate, resolveComplaint);

export default router;
