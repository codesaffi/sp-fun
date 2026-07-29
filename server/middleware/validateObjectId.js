import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";

export const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return next(new AppError("Invalid ID format", 400));
  }
  next();
};
