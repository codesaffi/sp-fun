import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import {
  cleanBody,
  cleanOptionalString,
  cleanSearch,
  cleanString,
  cleanTags,
  validateSlug,
} from "../utils/validation.js";
import { ensureOfficialCommunities, slugify } from "../services/community.service.js";
import { createNotification } from "../services/notification.service.js";

const memberCount = async (community) => CommunityMember.countDocuments({ community: community._id });

const serialize = async (community, userId) => {
  const [members, membership] = await Promise.all([
    memberCount(community),
    userId ? CommunityMember.findOne({ community: community._id, user: userId }).lean() : null,
  ]);
  return { ...(community.toObject ? community.toObject() : community), memberCount: members, membership: membership || null };
};

const serializeMany = async (communities, userId) => {
  const ids = communities.map((community) => community._id);
  const [counts, memberships] = await Promise.all([
    CommunityMember.aggregate([
      { $match: { community: { $in: ids } } },
      { $group: { _id: "$community", count: { $sum: 1 } } },
    ]),
    userId
      ? CommunityMember.find({ community: { $in: ids }, user: userId }).lean()
      : [],
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
  const membershipMap = new Map(memberships.map((item) => [String(item.community), item]));
  return communities.map((community) => ({
    ...(community.toObject ? community.toObject() : community),
    memberCount: countMap.get(String(community._id)) || 0,
    membership: membershipMap.get(String(community._id)) || null,
  }));
};

const requireCommunity = async (slug) => {
  const community = await Community.findOne({ slug: validateSlug(slug) });
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
  const q = req.query.q ? cleanSearch(req.query.q, "Community search") : "";
  const filter = q ? { $text: { $search: q } } : {};
  const communities = await Community.find(filter).sort({ official: -1, createdAt: -1 }).limit(100).lean();
  const values = await serializeMany(communities, req.user.id);
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
  const memberships = await CommunityMember.find({ user: req.user.id }).populate("community").lean();
  const values = await serializeMany(memberships.filter((item) => item.community).map((item) => item.community), req.user.id);
  res.json(values);
};

export const createCommunity = async (req, res) => {
  const body = cleanBody(req.body);
  const name = cleanString(body.name, "Community name", { required: true, max: 80 });
  const description = cleanString(body.description, "Community description", { required: true, max: 500 });
  const baseSlug = slugify(name);
  if (!baseSlug) throw new AppError("Enter a valid community name.", 400);
  const exists = await Community.exists({ slug: baseSlug });
  if (exists) throw new AppError("A community with this name already exists.", 409);
  const community = await Community.create({
    name,
    description,
    slug: baseSlug,
    createdBy: req.user.id,
    coverImage: cleanString(body.coverImage, "Cover image", { max: 1000 }),
    icon: cleanString(body.icon || "♫", "Community icon", { max: 20 }),
    genre: cleanString(body.genre, "Community genre", { max: 80 }),
    privacy: body.privacy === "private" ? "private" : "public",
    tags: cleanTags(body.tags),
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
  const body = cleanBody(req.body);
  const description = cleanOptionalString(body.description, "Community description", 500);
  const coverImage = cleanOptionalString(body.coverImage, "Cover image", 1000);
  const icon = cleanOptionalString(body.icon, "Community icon", 20);
  const genre = cleanOptionalString(body.genre, "Community genre", 80);
  if (description !== undefined) community.description = description;
  if (coverImage !== undefined) community.coverImage = coverImage;
  if (icon !== undefined) community.icon = icon;
  if (genre !== undefined) community.genre = genre;
  if (body.privacy !== undefined) community.privacy = body.privacy === "private" ? "private" : "public";
  if (Array.isArray(body.tags)) community.tags = cleanTags(body.tags);
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
  const body = cleanBody(req.body);
  const title = cleanString(body.title, "Rule title", { required: true, max: 100 });
  const description = cleanString(body.description, "Rule description", { required: true, max: 500 });
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
    .populate("comments.user", "name avatar")
    .lean();
  res.json(posts);
};

export const listCommunityMembers = async (req, res) => {
  const community = await requireCommunity(req.params.slug);
  const membership = await CommunityMember.findOne({ community: community._id, user: req.user.id });
  if (community.privacy === "private" && !membership) throw new AppError("This is a private community.", 403);
  res.json(await CommunityMember.find({ community: community._id }).sort({ role: 1, createdAt: 1 }).limit(200).populate("user", "name avatar").lean());
};
