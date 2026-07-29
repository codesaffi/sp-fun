import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { trustedOrigins } from "../config/env.js";

const rateLimitHandler = (req, res) =>
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });

export const createRateLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    ...options,
  });

export const spotifyAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
});

export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 45,
});

export const writeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
});

export const interactionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 80,
});

export const securityMiddleware = (app) => {
  const allowedOrigins = trustedOrigins();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: { action: "deny" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    next();
  });
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        const error = new Error("Not allowed by CORS");
        error.statusCode = 403;
        return callback(error);
      },
    }),
  );
  app.use("/auth", spotifyAuthLimiter);
  app.use("/api", apiLimiter);
};
