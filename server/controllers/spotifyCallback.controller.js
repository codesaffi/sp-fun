import axios from "axios";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { analyseUser } from "../services/musicInsights.service.js";
import { requestSpotifyAccessToken } from "../services/spotify.service.js";

const spotifyApiGet = async (accessToken, url) => {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const spotifyCallback = async (req, res) => {
  const { code, error: spotifyError } = req.query;

  if (spotifyError) {
    throw new AppError(`Spotify authorization failed: ${spotifyError}`, 400);
  }

  if (!code) {
    throw new AppError("Missing Spotify authorization code", 400);
  }

  try {
    const tokenResponse = await requestSpotifyAccessToken(code);

    const accessToken = tokenResponse.access_token;
    const refreshToken = tokenResponse.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new AppError("Spotify token exchange returned incomplete credentials", 500);
    }

    const spotifyUser = await spotifyApiGet(accessToken, "https://api.spotify.com/v1/me");

    const fetchTop = async (range) => {
      const topArtistsRes = await spotifyApiGet(accessToken, `https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${range}`);
      const topTracksRes = await spotifyApiGet(accessToken, `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${range}`);

      const topArtists = (topArtistsRes.items || []).map((artist) => ({
        name: artist.name,
        image: artist.images?.[0]?.url,
        genres: artist.genres || [],
      }));

      const topTracks = (topTracksRes.items || []).map((track) => ({
        name: track.name,
        artist: track.artists?.[0]?.name,
        image: track.album?.images?.[0]?.url,
      }));

      return { topArtists, topTracks };
    };

    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      fetchTop("short_term"),
      fetchTop("medium_term"),
      fetchTop("long_term"),
    ]);

    let user = await User.findOne({ spotifyId: spotifyUser.id });

    if (!user) {
      user = await User.create({
        spotifyId: spotifyUser.id,
        name: spotifyUser.display_name,
        email: spotifyUser.email,
        avatar: spotifyUser.images?.[0]?.url,
        accessToken,
        refreshToken,
        stats: { shortTerm, mediumTerm, longTerm },
      });
    } else {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.stats = { shortTerm, mediumTerm, longTerm };
    }
    // Store a reusable, explainable analysis on every Spotify refresh.
    user.analysis = { ...analyseUser(user), updatedAt: new Date() };
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${redirectUrl}/success?token=${token}`);
  } catch (error) {
    console.error("Spotify callback failed:", error.response?.data || error.message);
    throw new AppError("Spotify login failed", 500);
  }
};
