import { Router } from "express";
const router = Router();

import { getActivity } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";
router.get("/:id/activity", authenticate, getActivity);
export default router;
