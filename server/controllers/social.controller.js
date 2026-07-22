import User from "../models/User.js";
import { analyseUser, compatibility, getMood, getMusicDna, getPersonality, genreDistribution, profileSignals } from "../services/musicInsights.service.js";

const publicUser = (user) => ({
  _id: user._id, name: user.name, avatar: user.avatar, country: user.country,
  personality: getPersonality(user), mood: getMood(user),
  favoriteArtist: profileSignals(user).artists[0]?.name || "Still listening",
});

export const myInsights = async (req, res) => {
  const user = await User.findById(req.user.id).select("-accessToken -refreshToken");
  if (!user) return res.status(404).json({ message: "User not found" });
  const signals = profileSignals(user);
  const analysis = analyseUser(user);
  // Backfill older accounts as soon as their dashboard is opened.
  if (!user.analysis?.personality) { user.analysis = { ...analysis, updatedAt: new Date() }; await user.save(); }
  res.json({ user: publicUser(user), personality: getPersonality(user), mood: getMood(user),
    topGenres: signals.genres.slice(0, 5), favoriteArtist: signals.artists[0] || null,
    favoriteTrack: signals.tracks[0] || null, listeningDiversity: signals.artistNames.length,
    musicDna: user.analysis?.averageFeatures || getMusicDna(user), genreDistribution: user.analysis?.genreDistribution || genreDistribution(user),
    description: user.analysis?.musicProfile || analysis.musicProfile });
};

export const discover = async (req, res) => {
  const me = await User.findById(req.user.id);
  const users = await User.find({ _id: { $ne: req.user.id } }).select("-accessToken -refreshToken");
  const query = String(req.query.q || "").toLowerCase();
  const results = users.map((user) => ({ ...publicUser(user), compatibility: compatibility(me, user) }))
    .filter((entry) => !query || JSON.stringify(entry).toLowerCase().includes(query))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
  res.json(results);
};

export const genres = async (req, res) => {
  try {
    const users = await User.find().select("stats analysis");
    const counts = new Map();
    users.forEach((user) => {
      const found = [...profileSignals(user).genres, ...(user.analysis?.topGenres || []).map(normalise)];
      unique(found).forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1));
    });
    res.json([...counts.entries()].map(([name, users]) => ({ name, users })).sort((a, b) => b.users - a.users));
  } catch { res.status(500).json({ message: "Could not load genres." }); }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ["bio", "country", "gender", "lookingFor"];
    const changes = Object.fromEntries(allowed.filter((key) => key in req.body).map((key) => [key, req.body[key]]));
    const user = await User.findByIdAndUpdate(req.user.id, changes, { new: true }).select("-accessToken -refreshToken");
    res.json(publicUser(user));
  } catch { res.status(400).json({ message: "Could not update profile." }); }
};

export const leaderboard = async (req, res) => {
  const me = await User.findById(req.user.id);
  const users = await User.find({ _id: { $ne: req.user.id } }).select("-accessToken -refreshToken");
  res.json(users.map((user) => ({ ...publicUser(user), compatibility: compatibility(me, user) }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score).slice(0, 10));
};

export const compare = async (req, res) => {
  const [me, user] = await Promise.all([User.findById(req.user.id), User.findById(req.params.userId)]);
  if (!user) return res.status(404).json({ message: "User not found" });
  const result = compatibility(me, user);
  res.json({ user: publicUser(user), ...result, reason: result.reasons[0] || "Your libraries have room to surprise each other." });
};
