import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import aiRoutes from "./modules/ai/routes.js";
import adminRoutes from "./modules/admin/routes.js";
import applicationsRoutes from "./modules/applications/routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import favoritesRoutes from "./modules/favorites/routes.js";
import offersRoutes from "./modules/offers/routes.js";
import reportsRoutes from "./modules/reports/routes.js";
import supportRoutes from "./modules/support/routes.js";

import { errorMiddleware } from "./middleware/error.js";
import { AppError } from "./utils/error.js";

export function createApp() {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    })
  );

  app.use(express.json());

  const isDev = process.env.NODE_ENV !== "production";

  const globalMax = isDev
    ? 1000
    : parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

  const loginMax = isDev
    ? 500
    : parseInt(process.env.RATE_LIMIT_LOGIN_MAX || "5", 10);

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: globalMax,
    })
  );

  app.use(
    "/auth/login",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: loginMax,
    })
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/offers", offersRoutes);
  app.use("/api/applications", applicationsRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/admin", adminRoutes);

  app.use((_req, _res, next) => {
    next(new AppError(404, "Route not found"));
  });

  app.use(errorMiddleware);

  return app;
}

export const app = createApp();

export default app;