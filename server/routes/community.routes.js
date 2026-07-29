import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  interactionLimiter,
  searchLimiter,
  writeLimiter,
} from "../middleware/security.middleware.js";
import { addRule, createCommunity, getCommunity, joinCommunity, leaveCommunity, listCommunities, listCommunityMembers, listCommunityPosts, listMyCommunities, removeMember, updateCommunity } from "../controllers/community.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", searchLimiter, asyncHandler(listCommunities));
router.get("/mine", asyncHandler(listMyCommunities));
router.post("/", writeLimiter, asyncHandler(createCommunity));
router.get("/:slug", asyncHandler(getCommunity));
router.patch("/:slug", writeLimiter, asyncHandler(updateCommunity));
router.post("/:slug/join", interactionLimiter, asyncHandler(joinCommunity));
router.delete("/:slug/members/me", asyncHandler(leaveCommunity));
router.delete("/:slug/members/:userId", validateObjectId("userId"), asyncHandler(removeMember));
router.post("/:slug/rules", writeLimiter, asyncHandler(addRule));
router.get("/:slug/posts", asyncHandler(listCommunityPosts));
router.get("/:slug/members", asyncHandler(listCommunityMembers));
export default router;
