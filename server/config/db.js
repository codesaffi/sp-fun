import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    if (process.env.NODE_ENV !== "production") console.log("MongoDB connected");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(error.message);
    throw error;
  }
};
