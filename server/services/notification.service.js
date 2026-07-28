import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotification = async (data) => {
  if (!data.recipient || (data.sender && String(data.recipient) === String(data.sender))) return null;
  try { return await Notification.create(data); } catch (error) { if (error.code === 11000) return null; throw error; }
};

export const notifyMentions = async ({ text, sender, post, diary, community }) => {
  const names = [...new Set([...String(text || "").matchAll(/@([\w.-]+)/g)].map((match) => match[1].toLowerCase()))];
  if (!names.length) return;
  const users = await User.find({ name: { $in: names.map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) } }).select("_id name");
  await Promise.all(users.map((user) => createNotification({ recipient: user._id, sender, type: "mention", title: "You were mentioned", message: "Someone mentioned you in a community conversation.", post, diary, community, dedupeKey: `mention:${post || diary}:${user._id}` })));
};
