import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", index: true },
    caption: { type: String, required: true, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: [
        "top_artist",
        "top_song",
        "profile",
        "mood",
        "genres",
        "recent",
        "custom",
      ],
      default: "custom",
    },
    artist: mongoose.Schema.Types.Mixed,
    song: mongoose.Schema.Types.Mixed,
    album: mongoose.Schema.Types.Mixed,
    genres: [String],
    musicProfile: String,
    mood: String,
    images: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
