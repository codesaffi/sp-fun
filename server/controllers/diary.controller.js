import mongoose from "mongoose";
import Diary from "../models/Diary.js";
import User from "../models/User.js";
import { spotifyApiRequest } from "../services/spotify.service.js";
import { AppError } from "../utils/appError.js";
import { createNotification } from "../services/notification.service.js";

const populateDiary = (query) =>
  query
    .populate("user", "name avatar")
    .populate("comments.user", "name avatar");
const typeMap = { song: "track", album: "album", artist: "artist" };
// Spotify reduced the Search endpoint maximum from 50 to 10 in February 2026.
const SPOTIFY_SEARCH_LIMIT = 10;
const image = (item) =>
  item?.images?.[0]?.url || item?.album?.images?.[0]?.url || "";
const formatItem = (item, type) => ({
  spotifyId: item.id,
  type,
  title: item.name,
  artist:
    type === "artist"
      ? item.name
      : item.artists?.map((artist) => artist.name).join(", ") || "Unknown",
  album: type === "song" ? item.album?.name || "" : "",
  image: image(item),
  releaseDate: type === "song" ? item.album?.release_date : item.release_date,
  genres: item.genres || [],
  popularity: item.popularity,
  followers: item.followers?.total,
});
 
export const searchSpotify = async (req, res) => {
  const query = req.query.q?.trim();
  const type = req.query.type || "song";
  if (!query || !typeMap[type])
    throw new AppError("A valid search query and type are required.", 400);
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found.", 404);
  const response = await spotifyApiRequest(
    user,
    "https://api.spotify.com/v1/search",
    {
      params: {
        q: query,
        type: typeMap[type],
        limit: SPOTIFY_SEARCH_LIMIT,
      },
    },
  );
  const key = `${typeMap[type]}s`;
  res.json(
    (response.data[key]?.items || []).map((item) => formatItem(item, type)),
  );
};
export const spotifyDetails = async (req, res) => {
  const apiType = typeMap[req.params.type];
  if (!apiType) throw new AppError("Invalid item type.", 400);
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found.", 404);
  const response = await spotifyApiRequest(
    user,
    `https://api.spotify.com/v1/${apiType}s/${req.params.spotifyId}`,
  );
  const detail = formatItem(response.data, req.params.type);
  if (req.params.type === "album")
    detail.tracks = (response.data.tracks?.items || []).map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists?.map((artist) => artist.name).join(", "),
      durationMs: track.duration_ms,
    }));
  if (req.params.type === "artist") {
    const related = await spotifyApiRequest(
      user,
      `https://api.spotify.com/v1/artists/${req.params.spotifyId}/related-artists`,
    ).catch(() => null);
    detail.related = (related?.data?.artists || [])
      .slice(0, 6)
      .map((artist) => formatItem(artist, "artist"));
  }
  if (req.params.type === "song" && response.data.artists?.[0]?.id) {
    const artistResponse = await spotifyApiRequest(
      user,
      `https://api.spotify.com/v1/artists/${response.data.artists[0].id}`,
    ).catch(() => null);
    detail.genres = artistResponse?.data?.genres || [];
  }
  res.json(detail);
};
export const createDiary = async (req, res) => {
  const {
    spotifyId,
    type,
    title,
    artist = "",
    album = "",
    image = "",
    rating,
    review = "",
    status,
    entryDate,
  } = req.body;
  if (!spotifyId || !typeMap[type] || !title || !status)
    throw new AppError("Missing diary entry details.", 400);
  try {
    const entry = await Diary.create({
      user: req.user.id,
      spotifyId,
      type,
      title,
      artist,
      album,
      image,
      rating,
      review,
      status,
      entryDate,
    });
    res.status(201).json(await populateDiary(Diary.findById(entry._id)));
  } catch (error) {
    if (error.code === 11000)
      throw new AppError("You already have a diary entry for this item.", 409);
    throw error;
  }
};
export const updateDiary = async (req, res) => {
  const allowed = ["rating", "review", "status", "entryDate"];
  const changes = Object.fromEntries(
    allowed
      .filter((key) => req.body[key] !== undefined)
      .map((key) => [key, req.body[key]]),
  );
  const entry = await Diary.findOneAndUpdate(
    { _id: req.params.entryId, user: req.user.id },
    changes,
    { new: true, runValidators: true },
  );
  if (!entry) throw new AppError("Diary entry not found.", 404);
  if (String(entry.user) !== String(req.user.id)) createNotification({ recipient: entry.user, sender: req.user.id, diary: entry._id, type: "diary_like", title: "Your diary review got a like", message: "Someone liked your diary review.", dedupeKey: `diary-like:${entry._id}:${req.user.id}` }).catch(() => {});
  if ([25, 50, 100].includes(entry.likes.length)) createNotification({ recipient: entry.user, diary: entry._id, type: "trending_review", title: "Your review is trending", message: `Your diary review reached ${entry.likes.length} likes.`, dedupeKey: `trending-review:${entry._id}:${entry.likes.length}` }).catch(() => {});
  res.json(await populateDiary(Diary.findById(entry._id)));
};
export const deleteDiary = async (req, res) => {
  const result = await Diary.deleteOne({
    _id: req.params.entryId,
    user: req.user.id,
  });
  if (!result.deletedCount) throw new AppError("Diary entry not found.", 404);
  res.status(204).end();
};
export const listMyDiary = async (req, res) =>
  res.json(
    await populateDiary(
      Diary.find({ user: req.user.id }).sort({ createdAt: -1 }),
    ),
  );
export const listUserDiary = async (req, res) =>
  res.json(
    await populateDiary(
      Diary.find({ user: req.params.userId }).sort({ createdAt: -1 }),
    ),
  );
export const toggleDiaryLike = async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.user.id);
  let entry = await Diary.findOneAndUpdate(
    { _id: req.params.entryId, likes: id },
    { $pull: { likes: id } },
    { new: true },
  );
  if (entry) return res.json({ liked: false, likes: entry.likes.length });
  entry = await Diary.findByIdAndUpdate(
    req.params.entryId,
    { $addToSet: { likes: id } },
    { new: true },
  );
  if (!entry) throw new AppError("Diary entry not found.", 404);
  res.json({ liked: true, likes: entry.likes.length });
};
export const addDiaryComment = async (req, res) => {
  if (!req.body.text?.trim())
    throw new AppError("A comment cannot be empty.", 400);
  const entry = await Diary.findById(req.params.entryId);
  if (!entry) throw new AppError("Diary entry not found.", 404);
  entry.comments.push({ user: req.user.id, text: req.body.text });
  await entry.save();
  if (String(entry.user) !== String(req.user.id)) createNotification({ recipient: entry.user, sender: req.user.id, diary: entry._id, type: "diary_comment", title: "New diary comment", message: "Someone commented on your diary review.", dedupeKey: `diary-comment:${entry._id}:${req.user.id}:${entry.comments.length}` }).catch(() => {});
  res.status(201).json(await populateDiary(Diary.findById(entry._id)));
};
