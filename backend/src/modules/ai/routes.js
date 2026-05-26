import express from "express";
import auth from "../../middleware/auth.middleware.js";
import validateBody from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async.js";
import * as controller from "./controller.js";
import {
  evaluateInterviewSchema,
  generateCoverLetterSchema,
  generateCvSchema,
  generateInterviewQuestionsSchema,
} from "./schemas.js";

const router = express.Router();

router.post("/cv", auth, validateBody(generateCvSchema), asyncHandler(controller.generateCvDraft));
router.post(
  "/cover-letter",
  auth,
  validateBody(generateCoverLetterSchema),
  asyncHandler(controller.generateCoverLetter)
);
router.post(
  "/interview/questions",
  auth,
  validateBody(generateInterviewQuestionsSchema),
  asyncHandler(controller.generateInterviewQuestions)
);
router.post(
  "/interview/evaluate",
  auth,
  validateBody(evaluateInterviewSchema),
  asyncHandler(controller.evaluateInterview)
);

export default router;
