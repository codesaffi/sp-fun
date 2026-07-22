import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import playerRoutes from "./routes/player.routes.js";
import advancedRoutes from "./routes/advancedTest.routes.js";
import socialRoutes from "./routes/social.routes.js";
import postRoutes from "./routes/post.routes.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
await connectDB();

const app = express();
securityMiddleware(app);

app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/advanced", advancedRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/posts", postRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    status: "Backend Running 🚀",
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
export default app;