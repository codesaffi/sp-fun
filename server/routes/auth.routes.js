import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { spotifyLogin } from "../controllers/auth.controller.js";
import { spotifyCallback } from "../controllers/spotifyCallback.controller.js";

const router = Router();

router.get("/spotify", asyncHandler(spotifyLogin));
router.get("/spotify/callback", asyncHandler(spotifyCallback));

export default router;
