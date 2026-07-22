import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { getMe, getAllUsers, getUserById } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, asyncHandler(getMe));
router.get("/all", verifyToken, asyncHandler(getAllUsers));
router.get("/:userId", verifyToken, validateObjectId("userId"), asyncHandler(getUserById));

export default router;
