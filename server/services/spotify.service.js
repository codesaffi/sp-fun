import axios from "axios";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

const refreshesInFlight = new Map();

const spotifyAuthHeaders = (clientId, clientSecret) => ({
  Authorization:
    "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
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
    {
      headers: spotifyAuthHeaders(
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET,
      ),
    },
  );
  return response.data;
};

export const refreshSpotifyToken = async (user) => {
  if (!user.refreshToken) {
    throw new AppError(
      "Your Spotify session has expired. Please sign in with Spotify again.",
      401,
    );
  }
  const key = String(user._id);
  if (refreshesInFlight.has(key)) return refreshesInFlight.get(key);
  const refresh = (async () => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: user.refreshToken,
        }),
        {
          headers: spotifyAuthHeaders(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
          ),
        },
      );
      user.accessToken = response.data.access_token;
      if (response.data.refresh_token)
        user.refreshToken = response.data.refresh_token;
      await user.save();
      return user;
    } catch (error) {
      throw new AppError(
        "Your Spotify session has expired. Please sign in with Spotify again.",
        error.response?.status || 401,
      );
    } finally {
      refreshesInFlight.delete(key);
    }
  })();
  refreshesInFlight.set(key, refresh);
  return refresh;
};

export const spotifyApiRequest = async (user, url, options = {}) => {
  if (!user?.accessToken)
    throw new AppError("Spotify is not connected for this account.", 401);
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
      try {
        return await axios({ url, headers: refreshedHeaders, ...options });
      } catch (retryError) {
        const status = retryError.response?.status || 502;
        const message =
          retryError.response?.data?.error?.message ||
          "Spotify could not complete this request.";
        throw new AppError(message, status);
      }
    }
    const status = error.response?.status || 502;
    const message =
      error.response?.data?.error?.message ||
      "Spotify could not complete this request.";
    if (process.env.NODE_ENV !== "production")
      console.error("Spotify API request failed:", status, message);
    throw new AppError(message, status);
  }
};

export const refreshSpotifyStats = async (user) => {
  const fetchTop = async (range) => {
    const [artistsResponse, tracksResponse] = await Promise.all([
      spotifyApiRequest(
        user,
        `https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${range}`,
      ),
      spotifyApiRequest(
        user,
        `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${range}`,
      ),
    ]);
    return {
      topArtists: (artistsResponse.data.items || []).map((artist) => ({
        name: artist.name,
        image: artist.images?.[0]?.url,
        genres: artist.genres || [],
      })),
      topTracks: (tracksResponse.data.items || []).map((track) => ({
        name: track.name,
        artist: track.artists?.[0]?.name,
        image: track.album?.images?.[0]?.url,
      })),
    };
  };
  const [shortTerm, mediumTerm, longTerm] = await Promise.all([
    fetchTop("short_term"),
    fetchTop("medium_term"),
    fetchTop("long_term"),
  ]);
  user.stats = { shortTerm, mediumTerm, longTerm };
  await user.save();
  return user.stats;
};

export const normalizeSpotifyTracks = (items) =>
  (items || []).map((item) => ({
    name: item.track?.name || item.name || "Unknown",
    artist:
      item.track?.artists?.[0]?.name || item.artists?.[0]?.name || "Unknown",
    image: item.track?.album?.images?.[0]?.url || item.album?.images?.[0]?.url,
    playedAt: item.played_at,
  }));
