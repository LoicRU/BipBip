import express from "express";
import auth from "../../middleware/auth.middleware.js";
import optionalAuth from "../../middleware/optional-auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import validateBody from "../../middleware/validate.middleware.js";
import * as controller from "./controller.js";
import {
  createOfferSchema,
  listOffersQuerySchema,
  offerIdParamsSchema,
  updateOfferSchema,
} from "./schemas.js";

const router = express.Router();

router.get(
  "/",
  optionalAuth,
  validate({ query: listOffersQuerySchema }),
  asyncHandler(controller.listOffers)
);

router.get(
  "/:id",
  optionalAuth,
  validate({ params: offerIdParamsSchema }),
  asyncHandler(controller.getOfferById)
);

router.post(
  "/",
  auth,
  requireRole(["recruiter", "admin"]),
  validateBody(createOfferSchema),
  asyncHandler(controller.createOffer)
);

router.put(
  "/:id",
  auth,
  requireRole(["recruiter", "admin"]),
  validate({ params: offerIdParamsSchema }),
  validateBody(updateOfferSchema),
  asyncHandler(controller.updateOffer)
);

router.delete(
  "/:id",
  auth,
  requireRole(["recruiter", "admin"]),
  validate({ params: offerIdParamsSchema }),
  asyncHandler(controller.deleteOffer)
);

export default router;
