import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { advancedSpotifyTest } from "../controllers/advancedTest.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/advanced", verifyToken, asyncHandler(advancedSpotifyTest));

export default router;