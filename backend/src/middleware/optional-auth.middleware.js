import { verifyToken } from "../utils/jwt.js";

export default function optionalAuthMiddleware(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyToken(token);
  } catch {
    req.user = undefined;
  }

  next();
}
