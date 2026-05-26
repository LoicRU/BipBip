import express from "express";
import { ZodError } from "zod";
import auth from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";
import validateBody from "../../middleware/validate.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";
import * as controller from "./controller.js";
import {
  applicationIdParamsSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "./schemas.js";
import { uploadApplicationCv } from "./upload.js";

const router = express.Router();

function normalizeCreateApplicationBody(req, _res, next) {
  try {
    const nextBody = {
      offerId: String(req.body?.offerId ?? "").trim(),
      coverLetter: String(req.body?.coverLetter ?? ""),
      cv: typeof req.body?.cv === "string" ? req.body.cv : "",
      candidatePhone: String(req.body?.candidatePhone ?? ""),
      aiInterview:
        typeof req.body?.aiInterview === "string" && req.body.aiInterview.trim()
          ? JSON.parse(req.body.aiInterview)
          : req.body?.aiInterview ?? null,
    };

    const validatedBody = createApplicationSchema.parse(nextBody);

    if (!validatedBody.cv && !req.file) {
      next(new AppError(400, "Le CV est requis pour postuler."));
      return;
    }

    req.validatedBody = validatedBody;
    next();
  } catch (error) {
    if (error instanceof SyntaxError) {
      next(new AppError(400, "Le format de l'entretien IA est invalide."));
      return;
    }

    if (error instanceof ZodError) {
      next(new AppError(400, "Validation error", error.errors));
      return;
    }

    next(error);
  }
}

router.post(
  "/",
  auth,
  requireRole(["tech", "admin"]),
  uploadApplicationCv.single("cvFile"),
  normalizeCreateApplicationBody,
  asyncHandler(controller.createApplication)
);

router.get(
  "/me",
  auth,
  requireRole(["tech", "admin"]),
  asyncHandler(controller.listMyApplications)
);

router.delete(
  "/:id",
  auth,
  requireRole(["tech", "admin"]),
  validate({ params: applicationIdParamsSchema }),
  asyncHandler(controller.removeMyApplication)
);

router.get(
  "/recruiter",
  auth,
  requireRole(["recruiter", "admin"]),
  asyncHandler(controller.listRecruiterApplications)
);

router.patch(
  "/:id/status",
  auth,
  requireRole(["recruiter", "admin"]),
  validate({ params: applicationIdParamsSchema }),
  validateBody(updateApplicationStatusSchema),
  asyncHandler(controller.updateApplicationStatus)
);

router.get(
  "/:id/cv",
  auth,
  validate({ params: applicationIdParamsSchema }),
  asyncHandler(controller.downloadApplicationCv)
);

export default router;
