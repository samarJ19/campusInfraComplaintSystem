import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

router.get("/", authenticate, getNotifications);

router.patch("/:id/read", authenticate, markAsRead);

router.patch("/read-all", authenticate, markAllAsRead);

export default router;
