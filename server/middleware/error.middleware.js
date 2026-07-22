export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Resource not found" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.publicMessage || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack || err.message || err);
  }

  res.status(statusCode).json({ success: false, message });
};
