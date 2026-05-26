import express from "express";
import { z } from "zod";
import auth from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";
import validateBody from "../../middleware/validate.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import * as controller from "./controller.js";

const router = express.Router();
const userIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});
const userStatusSchema = z.object({
  status: z.enum(["active", "pending", "blocked"]),
});

router.use(auth, requireRole("admin"));

router.get("/dashboard", asyncHandler(controller.getDashboard));
router.get("/summary", asyncHandler(controller.getSummary));
router.get("/source-status", asyncHandler(controller.getSourceStatus));
router.get("/offers-preview", asyncHandler(controller.getSourcePreview));
router.get("/users", asyncHandler(controller.listUsers));
router.patch(
  "/users/:id/status",
  validate({ params: userIdParamsSchema }),
  validateBody(userStatusSchema),
  asyncHandler(controller.updateUserStatus)
);

export default router;
