import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { sanitizeString } from "../utils/sanitize.js";
import { ensureOfficialCommunities, slugify } from "../services/community.service.js";
import { createNotification } from "../services/notification.service.js";

const memberCount = async (community) => CommunityMember.countDocuments({ community: community._id });
const serialize = async (community, userId) => {
  const [members, membership] = await Promise.all([
    memberCount(community),
    userId ? CommunityMember.findOne({ community: community._id, user: userId }).lean() : null,
  ]);
  return { ...community.toObject(), memberCount: members, membership: membership || null };
};
const requireCommunity = async (slug) => {
  const community = await Community.findOne({ slug });
  if (!community) throw new AppError("Community not found.", 404);
  return community;
};
const requireRole = async (community, userId, roles = ["admin"]) => {
  const membership = await CommunityMember.findOne({ community: community._id, user: userId });
  if (!membership || !roles.includes(membership.role)) throw new AppError("You do not have permission to manage this community.", 403);
  return membership;
};

export const listCommunities = async (req, res) => {
  await ensureOfficialCommunities(req.user.id);
  const q = sanitizeString(req.query.q || "");
  const filter = q ? { $text: { $search: q } } : {};
  const communities = await Community.find(filter).sort({ official: -1, createdAt: -1 }).limit(100);
  const values = await Promise.all(communities.map((community) => serialize(community, req.user.id)));
  const byActivity = [...values].sort((a, b) => b.memberCount - a.memberCount);
  const user = await User.findById(req.user.id).select("analysis stats").lean();
  const tastes = [
    ...(user?.analysis?.topGenres || []),
    ...(user?.stats?.shortTerm?.topArtists || []).map((artist) => artist.name),
  ].map((value) => String(value).toLowerCase());
  const suggested = values.filter((community) => tastes.some((taste) =>
    `${community.name} ${community.genre} ${(community.tags || []).join(" ")}`.toLowerCase().includes(taste) ||
    taste.includes(community.name.toLowerCase()),
  )).slice(0, 6);
  res.json({
    communities: values,
    trending: byActivity.slice(0, 6),
    newest: [...values].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    active: byActivity.slice(0, 6),
    official: values.filter((community) => community.official),
    user: values.filter((community) => !community.official),
    suggested,
  });
};

export const listMyCommunities = async (req, res) => {
  const memberships = await CommunityMember.find({ user: req.user.id }).populate("community");
  const values = await Promise.all(memberships.filter((item) => item.community).map((item) => serialize(item.community, req.user.id)));
  res.json(values);
};

export const createCommunity = async (req, res) => {
  const name = sanitizeString(req.body.name || "");
  const description = sanitizeString(req.body.description || "");
  if (!name || !description) throw new AppError("A community name and description are required.", 400);
  const baseSlug = slugify(name);
  if (!baseSlug) throw new AppError("Enter a valid community name.", 400);
  const exists = await Community.exists({ slug: baseSlug });
  if (exists) throw new AppError("A community with this name already exists.", 409);
  const community = await Community.create({
    name, description, slug: baseSlug, createdBy: req.user.id,
    coverImage: sanitizeString(req.body.coverImage || ""), icon: sanitizeString(req.body.icon || "♫"),
    genre: sanitizeString(req.body.genre || ""), privacy: req.body.privacy === "private" ? "private" : "public",
    tags: Array.isArray(req.body.tags) ? req.body.tags.map(sanitizeString).filter(Boolean).slice(0, 10) : [],
  });
  await CommunityMember.create({ community: community._id, user: req.user.id, role: "admin" });
  res.status(201).json(await serialize(community, req.user.id));
};

export const getCommunity = async (req, res) => {
  await ensureOfficialCommunities(req.user.id);
  const community = await requireCommunity(req.params.slug);
  const result = await serialize(community, req.user.id);
  if (community.privacy === "private" && !result.membership) throw new AppError("This is a private community.", 403);
  const admin = await CommunityMember.findOne({ community: community._id, role: "admin" }).populate("user", "name avatar");
  res.json({ ...result, admin: admin?.user || null });
};

export const joinCommunity = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  if (community.privacy === "private") throw new AppError("This private community requires an invitation.", 403);
  const joined = await CommunityMember.updateOne({ community: community._id, user: req.user.id }, { $setOnInsert: { role: "member" } }, { upsert: true });
  if (joined.upsertedCount) {
    const admin = await CommunityMember.findOne({ community: community._id, role: "admin" });
    if (admin) createNotification({ recipient: admin.user, sender: req.user.id, community: community._id, type: "community_join", title: "New community member", message: `Someone joined your ${community.name} community.`, dedupeKey: `community-join:${community._id}:${req.user.id}` }).catch(() => {});
    const count = await memberCount(community);
    if ([100, 500, 1000].includes(count) && admin) createNotification({ recipient: admin.user, community: community._id, type: "community_milestone", title: "Community milestone", message: `Your ${community.name} community reached ${count} members.`, dedupeKey: `community-milestone:${community._id}:${count}` }).catch(() => {});
  }
  res.json(await serialize(community, req.user.id));
};
export const leaveCommunity = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
  if (!membership) throw new AppError("You have not joined this community.", 400);
  if (membership.role === "admin") throw new AppError("Transfer or delete the community before leaving it.", 400);
  await membership.deleteOne();
  const admin = await CommunityMember.findOne({ community: community._id, role: "admin" });
  if (admin) createNotification({ recipient: admin.user, sender: req.user.id, community: community._id, type: "community_leave", title: "Member left", message: `A member left your ${community.name} community.`, dedupeKey: `community-leave:${community._id}:${req.user.id}:${Date.now()}` }).catch(() => {});
  res.status(204).end();
};
export const updateCommunity = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  await requireRole(community, req.user.id);
  for (const key of ["description", "coverImage", "icon", "genre"]) if (req.body[key] !== undefined) community[key] = sanitizeString(req.body[key]);
  if (req.body.privacy !== undefined) community.privacy = req.body.privacy === "private" ? "private" : "public";
  if (Array.isArray(req.body.tags)) community.tags = req.body.tags.map(sanitizeString).filter(Boolean).slice(0, 10);
  await community.save();
  res.json(await serialize(community, req.user.id));
};
export const removeMember = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  await requireRole(community, req.user.id);
  const member = await CommunityMember.findOne({ community: community._id, user: req.params.userId });
  if (!member) throw new AppError("Member not found.", 404);
  if (member.role === "admin") throw new AppError("An admin cannot be removed.", 400);
  await member.deleteOne();
  res.status(204).end();
};
export const addRule = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  await requireRole(community, req.user.id);
  const title = sanitizeString(req.body.title || ""), description = sanitizeString(req.body.description || "");
  if (!title || !description) throw new AppError("A rule title and description are required.", 400);
  community.rules.push({ title, description });
  await community.save();
  res.json(await serialize(community, req.user.id));
};
export const listCommunityPosts = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
  if (community.privacy === "private" && !membership) throw new AppError("This is a private community.", 403);
  const posts = await Post.find({ community: community._id }).sort({ createdAt: -1 }).limit(50)
    .populate("user", "name avatar").populate("community", "name slug icon")
    .populate("comments.user", "name avatar");
  res.json(posts);
};
export const listCommunityMembers = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
  if (community.privacy === "private" && !membership) throw new AppError("This is a private community.", 403);
  res.json(await CommunityMember.find({ community: community._id }).sort({ role: 1, createdAt: 1 }).limit(200).populate("user", "name avatar"));
};
