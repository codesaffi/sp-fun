import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError("Authorization token missing", 401));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError("Authorization token missing", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};
