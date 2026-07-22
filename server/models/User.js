import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: String,
    email: String,
    avatar: String,
    country: String,
    gender: { type: String, enum: ["male", "female", "nonbinary", "other", ""], default: "" },
    lookingFor: { type: String, enum: ["male", "female", "everyone", ""], default: "everyone" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    accessToken: String,
    refreshToken: String,

    stats: {
      shortTerm: {
        topArtists: Array,
        topTracks: Array,
      },
      mediumTerm: {
        topArtists: Array,
        topTracks: Array,
      },
      longTerm: {
        topArtists: Array,
        topTracks: Array,
      },
    },

    recentlyPlayed: Array,
    bio: { type: String, default: "" },
    analysis: {
      mood: String, moodDescription: String, musicProfile: String,
      topGenres: [String], favoriteArtist: mongoose.Schema.Types.Mixed,
      favoriteSong: mongoose.Schema.Types.Mixed, averageFeatures: mongoose.Schema.Types.Mixed,
      personality: String, genreDistribution: [mongoose.Schema.Types.Mixed],
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
