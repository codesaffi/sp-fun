import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { spotifyApiRequest } from "../services/spotify.service.js";

export const getRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const response = await spotifyApiRequest(user, "https://api.spotify.com/v1/me/player/recently-played?limit=20");

    const tracks = (response.data.items || []).map((item) => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      image: item.track.album.images[0]?.url,
      playedAt: item.played_at,
    }));

    // ✅ Save to database (overwrite old data)
    user.recentlyPlayed = tracks;
    await user.save();

    res.json(tracks);
  } catch (error) {
    throw new AppError("Failed to fetch recently played tracks", error.response?.status || 500);
  }
};