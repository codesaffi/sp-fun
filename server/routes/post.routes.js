import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { addComment, createPost, deletePost, listPosts, toggleLike, updatePost } from "../controllers/post.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", asyncHandler(listPosts));
router.post("/", asyncHandler(createPost));
router.patch("/:postId", validateObjectId("postId"), asyncHandler(updatePost));
router.delete("/:postId", validateObjectId("postId"), asyncHandler(deletePost));
router.post("/:postId/like", validateObjectId("postId"), asyncHandler(toggleLike));
router.post("/:postId/comments", validateObjectId("postId"), asyncHandler(addComment));
export default router;
