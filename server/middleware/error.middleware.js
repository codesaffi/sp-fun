export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Resource not found" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;
  const message =
    err.publicMessage || (safeStatus < 500 ? err.message : "Internal server error");

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack || err.message || err);
  }

  res.status(safeStatus).json({ success: false, message });
};
