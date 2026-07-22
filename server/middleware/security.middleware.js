import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";

export const securityMiddleware = (app) => {
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(
    "/auth",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
  );
  app.use(
    "/api",
    rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })
  );
};
