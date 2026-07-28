import mongoose from "mongoose";
import Post from "../models/Post.js";

const populatePost = (query) =>
  query
    .populate("user", "name avatar")
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
    } = req.body;
    if (!caption?.trim())
      return res.status(400).json({ message: "A caption is required." });
    const post = await Post.create({
      user: req.user.id,
      caption,
      type,
      artist,
      song,
      genres,
      musicProfile,
      mood,
      images,
    });
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
    const result = await Post.deleteOne({
      _id: req.params.postId,
      user: req.user.id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Post not found." });
    res.status(204).end();
  } catch {
    res.status(400).json({ message: "Could not delete this post." });
  }
};
export const toggleLike = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user.id);
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
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    res.status(201).json(await populatePost(Post.findById(post._id)));
  } catch {
    res.status(400).json({ message: "Could not add this comment." });
  }
};
