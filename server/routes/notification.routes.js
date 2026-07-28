import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { clearNotifications, deleteNotification, listNotifications, markAllRead, markRead } from "../controllers/notification.controller.js";
const router = express.Router(); router.use(verifyToken);
router.get("/", asyncHandler(listNotifications)); router.patch("/read-all", asyncHandler(markAllRead)); router.delete("/", asyncHandler(clearNotifications));
router.patch("/:notificationId/read", validateObjectId("notificationId"), asyncHandler(markRead)); router.delete("/:notificationId", validateObjectId("notificationId"), asyncHandler(deleteNotification));
export default router;
