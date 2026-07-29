import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  interactionLimiter,
  writeLimiter,
} from "../middleware/security.middleware.js";
import {
  addComment,
  createPost,
  deletePost,
  listPosts,
  listPostsByUser,
  toggleLike,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", asyncHandler(listPosts));
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  asyncHandler(listPostsByUser),
);
router.post("/", writeLimiter, asyncHandler(createPost));
router.patch("/:postId", validateObjectId("postId"), writeLimiter, asyncHandler(updatePost));
router.delete("/:postId", validateObjectId("postId"), asyncHandler(deletePost));
router.post(
  "/:postId/like",
  validateObjectId("postId"),
  interactionLimiter,
  asyncHandler(toggleLike),
);
router.post(
  "/:postId/comments",
  validateObjectId("postId"),
  writeLimiter,
  asyncHandler(addComment),
);
export default router;
