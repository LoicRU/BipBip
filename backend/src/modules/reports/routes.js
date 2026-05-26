import express from "express";
import auth from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";
import validateBody from "../../middleware/validate.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import * as controller from "./controller.js";
import { createReportSchema, reportIdParamsSchema } from "./schemas.js";

const router = express.Router();

router.post(
  "/",
  auth,
  requireRole(["tech", "recruiter", "admin"]),
  validateBody(createReportSchema),
  asyncHandler(controller.createReport)
);

router.get(
  "/",
  auth,
  requireRole("admin"),
  asyncHandler(controller.listReports)
);

router.patch(
  "/:id/resolve",
  auth,
  requireRole("admin"),
  validate({ params: reportIdParamsSchema }),
  asyncHandler(controller.resolveReport)
);

router.delete(
  "/:id",
  auth,
  requireRole("admin"),
  validate({ params: reportIdParamsSchema }),
  asyncHandler(controller.deleteReport)
);

export default router;
