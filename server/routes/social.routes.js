import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { compare, discover, genres, leaderboard, myInsights, updateProfile } from "../controllers/social.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/insights", asyncHandler(myInsights));
router.get("/discover", asyncHandler(discover));
router.get("/leaderboard", asyncHandler(leaderboard));
router.get("/genres", asyncHandler(genres));
router.patch("/profile", asyncHandler(updateProfile));
router.get("/compare/:userId", validateObjectId("userId"), asyncHandler(compare));
export default router;
