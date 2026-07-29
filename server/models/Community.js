import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    coverImage: { type: String, default: "" },
    icon: { type: String, default: "♫", maxlength: 500 },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    genre: { type: String, trim: true, maxlength: 60, default: "" },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
    official: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rules: [ruleSchema],
  },
  { timestamps: true },
);

communitySchema.index({ name: "text", description: "text", tags: "text", genre: "text" });
communitySchema.index({ official: -1, createdAt: -1 });
export default mongoose.model("Community", communitySchema);
