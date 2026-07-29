import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-accessToken -refreshToken", // exclude tokens for security
    ).lean();

    if (!user) throw new AppError("User not found", 404);

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Server error", 500);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except the current user, exclude tokens for security
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "-accessToken -refreshToken",
    ).lean();

    res.json(users);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Error fetching users:", error.message);
    throw new AppError("Server error", 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-accessToken -refreshToken", // exclude tokens for security
    ).lean();

    if (!user) throw new AppError("User not found", 404);

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (process.env.NODE_ENV !== "production") console.error("Error fetching user:", error.message);
    throw new AppError("Server error", 500);
  }
};
