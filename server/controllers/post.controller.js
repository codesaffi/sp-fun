import mongoose from "mongoose";
import Post from "../models/Post.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import { createNotification, notifyMentions } from "../services/notification.service.js";
import { AppError } from "../utils/appError.js";
import {
  cleanBody,
  cleanString,
  cleanTags,
  validateEnum,
  validateSlug,
} from "../utils/validation.js";

const populatePost = (query) =>
  query
    .populate("user", "name avatar")
    .populate("community", "name slug icon")
    .populate("comments.user", "name avatar");

export const listPosts = async (req, res) => {
  try {
    res.json(
      await populatePost(Post.find().sort({ createdAt: -1 }).limit(100)),
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not load the feed.", 500);
  }
};
export const listPostsByUser = async (req, res) => {
  try {
    res.json(
      await populatePost(
        Post.find({ user: req.params.userId }).sort({ createdAt: -1 }),
      ),
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not load these posts.", 500);
  }
};
export const createPost = async (req, res) => {
  try {
    const body = cleanBody(req.body);
    const {
      caption,
      type = "custom",
      artist,
      song,
      genres = [],
      musicProfile,
      mood,
      images = [],
      album,
      community: communitySlug,
    } = body;
    const cleanCaption = cleanString(caption, "Caption", {
      required: true,
      max: 1000,
    });
    const cleanType = validateEnum(
      type,
      ["top_artist", "top_song", "profile", "mood", "genres", "recent", "custom"],
      "post type",
      "custom",
    );
    let community;
    if (communitySlug) {
      community = await Community.findOne({ slug: validateSlug(communitySlug) });
      if (!community) throw new AppError("Community not found.", 404);
      const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
      if (!membership) throw new AppError("Join this community before posting.", 403);
    }
    const post = await Post.create({
      user: req.user.id,
      caption: cleanCaption,
      type: cleanType,
      artist,
      song,
      album,
      genres: cleanTags(genres),
      musicProfile: cleanString(musicProfile, "Music profile", { max: 120 }),
      mood: cleanString(mood, "Mood", { max: 80 }),
      images: Array.isArray(images) ? images.map((item) => cleanString(item, "Image URL", { max: 1000 })).slice(0, 8) : [],
      community: community?._id,
    });
    if (community) {
      const members = await CommunityMember.find({ community: community._id, user: { $ne: req.user.id } }).select("user");
      await Promise.all(members.map((member) => createNotification({ recipient: member.user, sender: req.user.id, type: "community_post", title: "New community post", message: `A member posted in ${community.name}.`, post: post._id, community: community._id, dedupeKey: `community-post:${post._id}:${member.user}` })));
      await notifyMentions({ text: cleanCaption, sender: req.user.id, post: post._id, community: community._id });
    }
    res.status(201).json(await populatePost(Post.findById(post._id)));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not create this post.", 400);
  }
};
export const updatePost = async (req, res) => {
  try {
    const body = cleanBody(req.body);
    const post = await Post.findOne({
      _id: req.params.postId,
      user: req.user.id,
    });
    if (!post) throw new AppError("Post not found.", 404);
    if (body.caption !== undefined)
      post.caption = cleanString(body.caption, "Caption", {
        required: true,
        max: 1000,
      });
    await post.save();
    res.json(await populatePost(Post.findById(post._id)));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not update this post.", 400);
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) throw new AppError("Post not found.", 404);
    const isOwner = String(post.user) === String(req.user.id);
    const membership = post.community
      ? await CommunityMember.findOne({ community: post.community, user: req.user.id })
      : null;
    if (!isOwner && membership?.role !== "admin") throw new AppError("You do not have permission to delete this post.", 403);
    await post.deleteOne();
    res.status(204).end();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not delete this post.", 400);
  }
};
export const toggleLike = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user.id);
    const existingPost = await Post.findById(req.params.postId).select("community");
    if (existingPost?.community && !await CommunityMember.exists({ community: existingPost.community, user: req.user.id })) {
      throw new AppError("Join this community to like its posts.", 403);
    }
    // Use atomic operators so concurrent clicks can never add this user twice.
    let post = await Post.findOneAndUpdate(
      { _id: req.params.postId, likes: id },
      { $pull: { likes: id } },
      { new: true },
    );
    if (post) return res.json({ liked: false, likes: post.likes.length });
    post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $addToSet: { likes: id } },
      { new: true },
    );
    if (!post) throw new AppError("Post not found.", 404);
    if (String(post.user) !== String(req.user.id)) {
      createNotification({ recipient: post.user, sender: req.user.id, post: post._id, community: post.community, type: "post_like", title: "Your post got a like", message: "Someone liked your post.", dedupeKey: `post-like:${post._id}:${req.user.id}` }).catch(() => {});
      if ([25, 50, 100].includes(post.likes.length)) createNotification({ recipient: post.user, post: post._id, community: post.community, type: "popular_post", title: "Your post is getting popular", message: `Your post reached ${post.likes.length} likes.`, dedupeKey: `popular-post:${post._id}:${post.likes.length}` }).catch(() => {});
    }
    res.json({ liked: true, likes: post.likes.length });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not update this like.", 400);
  }
};
export const addComment = async (req, res) => {
  try {
    const body = cleanBody(req.body);
    const text = cleanString(body.text, "Comment", { required: true, max: 500 });
    const post = await Post.findById(req.params.postId);
    if (!post) throw new AppError("Post not found.", 404);
    if (post.community && !await CommunityMember.exists({ community: post.community, user: req.user.id })) {
      throw new AppError("Join this community to comment.", 403);
    }
    post.comments.push({ user: req.user.id, text });
    await post.save();
    if (String(post.user) !== String(req.user.id)) {
      createNotification({ recipient: post.user, sender: req.user.id, post: post._id, community: post.community, type: "post_comment", title: "New comment", message: "Someone commented on your post.", dedupeKey: `post-comment:${post._id}:${req.user.id}:${post.comments.length}` }).catch(() => {});
    }
    if (post.community) notifyMentions({ text, sender: req.user.id, post: post._id, community: post.community }).catch(() => {});
    res.status(201).json(await populatePost(Post.findById(post._id)));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not add this comment.", 400);
  }
};
