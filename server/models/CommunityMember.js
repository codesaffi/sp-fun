import mongoose from "mongoose";

const communityMemberSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["admin", "moderator", "member"], default: "member" },
  },
  { timestamps: true },
);

communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });
communityMemberSchema.index({ community: 1, role: 1, createdAt: 1 });
communityMemberSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("CommunityMember", communityMemberSchema);
