export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/[<>"'`;]/g, "").trim();
};

export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, typeof value === "string" ? sanitizeString(value) : value])
  );
};
