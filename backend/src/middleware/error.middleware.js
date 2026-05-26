export default function errorMiddleware(err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  const status = err.statusCode || err.status || 500;
  const message = status === 500
    ? "Une erreur interne est survenue"
    : err.message || "Une erreur est survenue";
  const payload = { error: message };

  if (err.details !== undefined) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}
