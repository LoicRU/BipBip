export function sendSuccess(res, statusCode, data, meta = undefined) {
  const payload = { data };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}
