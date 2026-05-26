import express from "express";
import { z } from "zod";
import auth from "../../middleware/auth.middleware.js";
import { validate as validateParams } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import * as controller from "./controller.js";

const router = express.Router();
const paramsSchema = z.object({
  offerId: z.string().trim().min(1),
});

router.get("/", auth, asyncHandler(controller.listFavorites));

router.post(
  "/:offerId",
  auth,
  validateParams({ params: paramsSchema }),
  asyncHandler(controller.addFavorite)
);

router.delete(
  "/:offerId",
  auth,
  validateParams({ params: paramsSchema }),
  asyncHandler(controller.removeFavorite)
);

export default router;
