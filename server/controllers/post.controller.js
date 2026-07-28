import mongoose from "mongoose";
import Post from "../models/Post.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import { createNotification, notifyMentions } from "../services/notification.service.js";

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
  } catch {
    res.status(500).json({ message: "Could not load the feed." });
  }
};
export const listPostsByUser = async (req, res) => {
  try {
    res.json(
      await populatePost(
        Post.find({ user: req.params.userId }).sort({ createdAt: -1 }),
      ),
    );
  } catch {
    res.status(500).json({ message: "Could not load these posts." });
  }
};
export const createPost = async (req, res) => {
  try {
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
    } = req.body;
    if (!caption?.trim())
      return res.status(400).json({ message: "A caption is required." });
    let community;
    if (communitySlug) {
      community = await Community.findOne({ slug: communitySlug });
      if (!community) return res.status(404).json({ message: "Community not found." });
      const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
      if (!membership) return res.status(403).json({ message: "Join this community before posting." });
    }
    const post = await Post.create({
      user: req.user.id,
      caption,
      type,
      artist,
      song,
      album,
      genres,
      musicProfile,
      mood,
      images,
      community: community?._id,
    });
    if (community) {
      const members = await CommunityMember.find({ community: community._id, user: { $ne: req.user.id } }).select("user");
      await Promise.all(members.map((member) => createNotification({ recipient: member.user, sender: req.user.id, type: "community_post", title: "New community post", message: `A member posted in ${community.name}.`, post: post._id, community: community._id, dedupeKey: `community-post:${post._id}:${member.user}` })));
      await notifyMentions({ text: caption, sender: req.user.id, post: post._id, community: community._id });
    }
    res.status(201).json(await populatePost(Post.findById(post._id)));
  } catch {
    res.status(400).json({ message: "Could not create this post." });
  }
};
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      user: req.user.id,
    });
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (req.body.caption?.trim()) post.caption = req.body.caption.trim();
    await post.save();
    res.json(await populatePost(Post.findById(post._id)));
  } catch {
    res.status(400).json({ message: "Could not update this post." });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const isOwner = String(post.user) === String(req.user.id);
    const membership = post.community
      ? await CommunityMember.findOne({ community: post.community, user: req.user.id })
      : null;
    if (!isOwner && membership?.role !== "admin") return res.status(403).json({ message: "You do not have permission to delete this post." });
    await post.deleteOne();
    res.status(204).end();
  } catch {
    res.status(400).json({ message: "Could not delete this post." });
  }
};
export const toggleLike = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user.id);
    const existingPost = await Post.findById(req.params.postId).select("community");
    if (existingPost?.community && !await CommunityMember.exists({ community: existingPost.community, user: req.user.id })) {
      return res.status(403).json({ message: "Join this community to like its posts." });
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
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.user) !== String(req.user.id)) {
      createNotification({ recipient: post.user, sender: req.user.id, post: post._id, community: post.community, type: "post_like", title: "Your post got a like", message: "Someone liked your post.", dedupeKey: `post-like:${post._id}:${req.user.id}` }).catch(() => {});
      if ([25, 50, 100].includes(post.likes.length)) createNotification({ recipient: post.user, post: post._id, community: post.community, type: "popular_post", title: "Your post is getting popular", message: `Your post reached ${post.likes.length} likes.`, dedupeKey: `popular-post:${post._id}:${post.likes.length}` }).catch(() => {});
    }
    res.json({ liked: true, likes: post.likes.length });
  } catch {
    res.status(400).json({ message: "Could not update this like." });
  }
};
export const addComment = async (req, res) => {
  try {
    if (!req.body.text?.trim())
      return res.status(400).json({ message: "A comment cannot be empty." });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.community && !await CommunityMember.exists({ community: post.community, user: req.user.id })) {
      return res.status(403).json({ message: "Join this community to comment." });
    }
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    if (String(post.user) !== String(req.user.id)) {
      createNotification({ recipient: post.user, sender: req.user.id, post: post._id, community: post.community, type: "post_comment", title: "New comment", message: "Someone commented on your post.", dedupeKey: `post-comment:${post._id}:${req.user.id}:${post.comments.length}` }).catch(() => {});
    }
    if (post.community) notifyMentions({ text: req.body.text, sender: req.user.id, post: post._id, community: post.community }).catch(() => {});
    res.status(201).json(await populatePost(Post.findById(post._id)));
  } catch {
    res.status(400).json({ message: "Could not add this comment." });
  }
};
