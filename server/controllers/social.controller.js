import User from "../models/User.js";
import {
  analyseUser,
  compatibility,
  getMood,
  getMusicDna,
  getPersonality,
  genreDistribution,
  profileSignals,
} from "../services/musicInsights.service.js";
import { refreshSpotifyStats } from "../services/spotify.service.js";
import { createNotification } from "../services/notification.service.js";
import { AppError } from "../utils/appError.js";
import {
  cleanBody,
  cleanOptionalString,
  cleanString,
  validateEnum,
} from "../utils/validation.js";

const normalise = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const unique = (items) => [...new Set(items.filter(Boolean))];

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  avatar: user.avatar,
  country: user.country,
  personality: getPersonality(user),
  mood: getMood(user),
  favoriteArtist: profileSignals(user).artists[0]?.name || "Still listening",
});

export const myInsights = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);
  const refreshing = req.query.refresh === "true";
  if (refreshing) await refreshSpotifyStats(user);
  const signals = profileSignals(user);
  const analysis = analyseUser(user);
  // Backfill older accounts as soon as their dashboard is opened.
  if (refreshing || !user.analysis?.personality) {
    user.analysis = { ...analysis, updatedAt: new Date() };
    await user.save();
  }
  res.json({
    user: publicUser(user),
    personality: getPersonality(user),
    mood: getMood(user),
    topGenres: signals.genres.slice(0, 5),
    favoriteArtist: signals.artists[0] || null,
    favoriteTrack: signals.tracks[0] || null,
    listeningDiversity: signals.artistNames.length,
    musicDna: user.analysis?.averageFeatures || getMusicDna(user),
    genreDistribution:
      user.analysis?.genreDistribution || genreDistribution(user),
    description: user.analysis?.musicProfile || analysis.musicProfile,
  });
};

export const discover = async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) throw new AppError("User not found", 404);
  const users = await User.find({ _id: { $ne: req.user.id } }).select(
    "-accessToken -refreshToken",
  ).lean();
  const query = cleanOptionalString(req.query.q, "Search query", 100)?.toLowerCase() || "";
  const results = users
    .map((user) => ({
      ...publicUser(user),
      compatibility: compatibility(me, user),
    }))
    .filter(
      (entry) => !query || JSON.stringify(entry).toLowerCase().includes(query),
    )
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
  res.json(results);
};

export const genres = async (req, res) => {
  try {
    const users = await User.find().select("stats analysis").lean();
    const counts = new Map();
    users.forEach((user) => {
      const found = [
        ...profileSignals(user).genres,
        ...(user.analysis?.topGenres || []).map(normalise),
      ];
      unique(found).forEach((genre) =>
        counts.set(genre, (counts.get(genre) || 0) + 1),
      );
    });
    res.json(
      [...counts.entries()]
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => b.users - a.users),
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not load genres.", 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const body = cleanBody(req.body);
    const allowed = ["bio", "country", "gender", "lookingFor"];
    const changes = {};
    if ("bio" in body) changes.bio = cleanString(body.bio, "Bio", { max: 500 });
    if ("country" in body) changes.country = cleanString(body.country, "Country", { max: 80 });
    if ("gender" in body)
      changes.gender = validateEnum(body.gender, ["male", "female", "nonbinary", "other", ""], "gender", "");
    if ("lookingFor" in body)
      changes.lookingFor = validateEnum(body.lookingFor, ["male", "female", "everyone", ""], "lookingFor", "everyone");
    for (const key of Object.keys(body)) {
      if (!allowed.includes(key)) delete body[key];
    }
    const user = await User.findByIdAndUpdate(req.user.id, changes, {
      new: true,
      runValidators: true,
    }).select("-accessToken -refreshToken").lean();
    res.json(publicUser(user));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not update profile.", 400);
  }
};

export const leaderboard = async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) throw new AppError("User not found", 404);
  const users = await User.find({ _id: { $ne: req.user.id } }).select(
    "-accessToken -refreshToken",
  ).lean();
  const ranked = users
      .map((user) => ({
        ...publicUser(user),
        compatibility: compatibility(me, user),
      }))
      .sort((a, b) => b.compatibility.score - a.compatibility.score)
      .slice(0, 10);
  await Promise.all(ranked.filter((entry) => entry.compatibility.score >= 80).map((entry) => {
    const bucket = Math.floor(entry.compatibility.score / 5) * 5;
    return Promise.all([
      createNotification({ recipient: me._id, relatedUser: entry._id, type: "music_match", title: "New music match", message: `You have a ${entry.compatibility.score}% music match with ${entry.name}.`, dedupeKey: `match:${entry._id}:${bucket}` }),
      createNotification({ recipient: entry._id, relatedUser: me._id, type: "music_match", title: "New music match", message: `You have a ${entry.compatibility.score}% music match with ${me.name}.`, dedupeKey: `match:${me._id}:${bucket}` }),
    ]);
  }));
  res.json(ranked);
};

export const compare = async (req, res) => {
  const [me, user] = await Promise.all([
    User.findById(req.user.id).lean(),
    User.findById(req.params.userId).lean(),
  ]);
  if (!me) throw new AppError("User not found", 404);
  if (!user) throw new AppError("User not found", 404);
  const result = compatibility(me, user);
  res.json({
    user: publicUser(user),
    ...result,
    reason:
      result.reasons[0] || "Your libraries have room to surprise each other.",
  });
};
