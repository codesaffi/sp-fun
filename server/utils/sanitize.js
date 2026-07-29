export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/[<>"'`;\\]/g, "").trim();
};

export const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (!obj || typeof obj !== "object") return sanitizeString(obj);
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !key.startsWith("$") && !key.includes("."))
      .map(([key, value]) => [key, sanitizeObject(value)]),
  );
};
