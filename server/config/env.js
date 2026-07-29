const production = process.env.NODE_ENV === "production";

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REDIRECT_URI",
];

export const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (production && !process.env.CLIENT_URL) missing.push("CLIENT_URL");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

export const trustedOrigins = () => {
  const origins = new Set();
  if (process.env.CLIENT_URL) origins.add(process.env.CLIENT_URL);
  if (!production) {
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:5173");
  }
  return origins;
};
