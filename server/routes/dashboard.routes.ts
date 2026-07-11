import { Router } from "express";

import { Role } from "../generated/prisma/enums";

import { authenticate } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

import { getStudentDashboard } from "../controllers/student.dashboard.controller";

import { getAdminDashboard } from "../controllers/admin.dashboard.controller";
import { getFacultyDashboard } from "../controllers/faculty.dashboard.conttroller";
import { getMaintenanceDashboard } from "../controllers/maintenance.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Student Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/student",

  authenticate,

  authorize(Role.STUDENT),

  getStudentDashboard,
);

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/admin",

  authenticate,

  authorize(Role.ADMIN),

  getAdminDashboard,
);

/*
|--------------------------------------------------------------------------
| Faculty Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/faculty",

  authenticate,

  authorize(Role.FACULTY),

  getFacultyDashboard,
);

/*
|--------------------------------------------------------------------------
| Faculty Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/maintenance",

  authenticate,

  authorize(Role.MAINTENANCE),

  getMaintenanceDashboard,
);

export default router;
