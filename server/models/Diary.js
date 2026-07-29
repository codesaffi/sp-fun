import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const diarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    spotifyId: { type: String, required: true },
    type: { type: String, enum: ["song", "album", "artist"], required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, default: "" },
    album: { type: String, default: "" },
    image: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: [
        "favorite",
        "listening",
        "listened",
        "want_to_listen",
        "revisited",
      ],
      default: "listened",
    },
    entryDate: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true },
);

diarySchema.index({ user: 1, spotifyId: 1, type: 1 }, { unique: true });
diarySchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Diary", diarySchema);
