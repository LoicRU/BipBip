import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const env = Object.freeze({
  JWT_SECRET,
  PORT: Number(process.env.PORT || 8000),
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://127.0.0.1:8010",
  AI_SERVICE_TIMEOUT_MS: Number(process.env.AI_SERVICE_TIMEOUT_MS || 60000),
});

export default env;
