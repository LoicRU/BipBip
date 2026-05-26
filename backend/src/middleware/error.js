export function errorMiddleware(error, _req, res, _next) {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
  ) {
    console.error(error);
  }

  res.status(error.statusCode ?? error.status ?? 500).json({
    error: {
      message: error.message || "Internal server error",
      details: error.details,
    },
  });
}
