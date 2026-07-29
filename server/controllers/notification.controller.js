import Notification from "../models/Notification.js";
import { AppError } from "../utils/appError.js";
import { parsePaginationLimit, validateDate } from "../utils/validation.js";

export const listNotifications = async (req, res) => {
  const limit = parsePaginationLimit(req.query.limit, { fallback: 30, min: 1, max: 50 });
  const filter = { recipient: req.user.id };
  if (req.query.before) filter.createdAt = { $lt: validateDate(req.query.before, "notification cursor") };
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit).populate("sender", "name avatar").populate("community", "name slug icon").populate("relatedUser", "name avatar");
  const unread = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
  res.json({ notifications, unread, next: notifications.at(-1)?.createdAt || null });
};
export const markRead = async (req, res) => {
  const result = await Notification.findOneAndUpdate({ _id: req.params.notificationId, recipient: req.user.id }, { isRead: true }, { new: true });
  if (!result) throw new AppError("Notification not found.", 404);
  res.json(result);
};
export const markAllRead = async (req, res) => { await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true }); res.status(204).end(); };
export const deleteNotification = async (req, res) => { const result = await Notification.deleteOne({ _id: req.params.notificationId, recipient: req.user.id }); if (!result.deletedCount) throw new AppError("Notification not found.", 404); res.status(204).end(); };
export const clearNotifications = async (req, res) => { await Notification.deleteMany({ recipient: req.user.id }); res.status(204).end(); };
