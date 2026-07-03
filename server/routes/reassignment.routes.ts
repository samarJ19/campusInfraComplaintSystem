import { Router } from "express";

import { Role } from "../generated/prisma/enums";

import { authenticate } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

import {
  requestReassignment,
  getPendingReassignments,
  approveReassignment,
  rejectReassignment,
  manualAssignComplaint,
  getAvailableMaintenanceStaff,
} from "../controllers/reassignment.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Maintenance
|--------------------------------------------------------------------------
*/

router.post(
  "/:complaintId/request",
  authenticate,
  authorize(Role.MAINTENANCE),
  requestReassignment
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/pending",
  authenticate,
  authorize(Role.ADMIN),
  getPendingReassignments
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize(Role.ADMIN),
  approveReassignment
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(Role.ADMIN),
  rejectReassignment
);

router.patch(
    "/:id/manual-assign",
    authenticate,
    authorize(
        Role.ADMIN,
        Role.FACULTY
    ),
    manualAssignComplaint
);

router.get(
    "/maintenance/:department",
    authenticate,
    authorize(
        Role.ADMIN,
        Role.FACULTY
    ),
    getAvailableMaintenanceStaff
);

export default router;