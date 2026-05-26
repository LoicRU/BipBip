import express from "express";
import auth from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";
import validateBody from "../../middleware/validate.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import * as controller from "./controller.js";
import {
  createSupportTicketSchema,
  supportTicketIdParamsSchema,
} from "./schemas.js";

const router = express.Router();

router.post(
  "/tickets",
  auth,
  requireRole(["tech", "recruiter", "admin"]),
  validateBody(createSupportTicketSchema),
  asyncHandler(controller.createSupportTicket)
);

router.get(
  "/tickets",
  auth,
  requireRole("admin"),
  asyncHandler(controller.listSupportTickets)
);

router.patch(
  "/tickets/:id/resolve",
  auth,
  requireRole("admin"),
  validate({ params: supportTicketIdParamsSchema }),
  asyncHandler(controller.resolveSupportTicket)
);

export default router;
