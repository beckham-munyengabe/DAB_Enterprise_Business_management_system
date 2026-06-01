export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Central error handler so controllers can simply `throw` or call next(err).
export function errorHandler(err, _req, res, _next) {
  console.error("[Error]", err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
