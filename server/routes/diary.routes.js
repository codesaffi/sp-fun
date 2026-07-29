import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  interactionLimiter,
  searchLimiter,
  writeLimiter,
} from "../middleware/security.middleware.js";
import {
  addDiaryComment,
  createDiary,
  deleteDiary,
  listMyDiary,
  listUserDiary,
  searchSpotify,
  spotifyDetails,
  toggleDiaryLike,
  updateDiary,
} from "../controllers/diary.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/search", searchLimiter, asyncHandler(searchSpotify));
router.get("/details/:type/:spotifyId", asyncHandler(spotifyDetails));
router.get("/me", asyncHandler(listMyDiary));
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  asyncHandler(listUserDiary),
);
router.post("/", writeLimiter, asyncHandler(createDiary));
router.put("/:entryId", validateObjectId("entryId"), writeLimiter, asyncHandler(updateDiary));
router.delete(
  "/:entryId",
  validateObjectId("entryId"),
  asyncHandler(deleteDiary),
);
router.post(
  "/:entryId/like",
  validateObjectId("entryId"),
  interactionLimiter,
  asyncHandler(toggleDiaryLike),
);
router.post(
  "/:entryId/comments",
  validateObjectId("entryId"),
  writeLimiter,
  asyncHandler(addDiaryComment),
);
export default router;
