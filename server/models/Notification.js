import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Schema.Types.ObjectId },
    diary: { type: mongoose.Schema.Types.ObjectId, ref: "Diary" },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false, index: true },
    dedupeKey: String,
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, dedupeKey: 1 }, { unique: true, sparse: true });
export default mongoose.model("Notification", notificationSchema);
