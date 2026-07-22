import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getRecentlyPlayed } from "../controllers/player.controller.js";

const router = express.Router();

router.get("/recently-played", verifyToken, asyncHandler(getRecentlyPlayed));

export default router;