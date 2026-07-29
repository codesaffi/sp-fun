import { AppError } from "./appError.js";
import { sanitizeObject, sanitizeString } from "./sanitize.js";

export const MAX_SEARCH_LENGTH = 100;
export const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{10,64}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const rejectMongoOperators = (value, path = "payload") => {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      throw new AppError(`Invalid ${path}.`, 400);
    }
    rejectMongoOperators(nested, `${path}.${key}`);
  }
};

export const cleanBody = (body) => {
  rejectMongoOperators(body);
  return sanitizeObject(body || {});
};

export const cleanString = (value, field, { required = false, max = 500 } = {}) => {
  const text = sanitizeString(value || "");
  if (required && !text) throw new AppError(`${field} is required.`, 400);
  if (text.length > max) throw new AppError(`${field} is too long.`, 400);
  return text;
};

export const cleanSearch = (value, field = "Search query") =>
  cleanString(value, field, { required: true, max: MAX_SEARCH_LENGTH });

export const cleanOptionalString = (value, field, max = 500) =>
  value === undefined ? undefined : cleanString(value, field, { max });

export const validateEnum = (value, allowed, field, fallback) => {
  const normalized = value === undefined || value === null || value === "" ? fallback : value;
  if (!allowed.includes(normalized)) {
    throw new AppError(`Invalid ${field}.`, 400);
  }
  return normalized;
};

export const validateNumberRange = (value, field, min, max, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new AppError(`${field} is required.`, 400);
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new AppError(`Invalid ${field}.`, 400);
  }
  return number;
};

export const validateSpotifyId = (value) => {
  const id = cleanString(value, "Spotify ID", { required: true, max: 64 });
  if (!SPOTIFY_ID_PATTERN.test(id)) throw new AppError("Invalid Spotify ID.", 400);
  return id;
};

export const validateSlug = (value) => {
  const slug = cleanString(value, "Community slug", { required: true, max: 100 }).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) throw new AppError("Invalid community slug.", 400);
  return slug;
};

export const validateDate = (value, field, { required = false } = {}) => {
  if (!value) {
    if (required) throw new AppError(`${field} is required.`, 400);
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(`Invalid ${field}.`, 400);
  return date;
};

export const parsePaginationLimit = (value, { fallback = 30, min = 1, max = 50 } = {}) => {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new AppError("Invalid pagination limit.", 400);
  }
  return number;
};

export const cleanTags = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .map((tag) => cleanString(tag, "Tag", { max: 40 }))
    .filter(Boolean)
    .slice(0, 10);
