import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
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
router.get("/search", asyncHandler(searchSpotify));
router.get("/details/:type/:spotifyId", asyncHandler(spotifyDetails));
router.get("/me", asyncHandler(listMyDiary));
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  asyncHandler(listUserDiary),
);
router.post("/", asyncHandler(createDiary));
router.put("/:entryId", validateObjectId("entryId"), asyncHandler(updateDiary));
router.delete(
  "/:entryId",
  validateObjectId("entryId"),
  asyncHandler(deleteDiary),
);
router.post(
  "/:entryId/like",
  validateObjectId("entryId"),
  asyncHandler(toggleDiaryLike),
);
router.post(
  "/:entryId/comments",
  validateObjectId("entryId"),
  asyncHandler(addDiaryComment),
);
export default router;
