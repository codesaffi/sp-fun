import axios from "axios";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

const spotifyAuthHeaders = (clientId, clientSecret) => ({
  Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
  "Content-Type": "application/x-www-form-urlencoded",
});

export const requestSpotifyAccessToken = async (code) => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
    { headers: spotifyAuthHeaders(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET) }
  );
  return response.data;
};

export const refreshSpotifyToken = async (user) => {
  if (!user.refreshToken) {
    throw new AppError("Spotify refresh token unavailable", 401);
  }

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: user.refreshToken,
    }),
    { headers: spotifyAuthHeaders(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET) }
  );

  user.accessToken = response.data.access_token;
  if (response.data.refresh_token) {
    user.refreshToken = response.data.refresh_token;
  }
  await user.save();

  return user;
};

export const spotifyApiRequest = async (user, url, options = {}) => {
  const headers = {
    Authorization: `Bearer ${user.accessToken}`,
    ...options.headers,
  };

  try {
    return await axios({ url, headers, ...options });
  } catch (error) {
    if (error.response?.status === 401) {
      const refreshedUser = await refreshSpotifyToken(user);
      const refreshedHeaders = {
        Authorization: `Bearer ${refreshedUser.accessToken}`,
        ...options.headers,
      };
      return await axios({ url, headers: refreshedHeaders, ...options });
    }
    throw error;
  }
};

export const normalizeSpotifyTracks = (items) =>
  (items || []).map((item) => ({
    name: item.track?.name || item.name || "Unknown",
    artist: item.track?.artists?.[0]?.name || item.artists?.[0]?.name || "Unknown",
    image: item.track?.album?.images?.[0]?.url || item.album?.images?.[0]?.url,
    playedAt: item.played_at,
  }));
