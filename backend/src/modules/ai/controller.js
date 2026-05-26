import { sendSuccess } from "../../utils/response.js";
import * as aiService from "./service.js";

export async function generateCvDraft(req, res) {
  const result = await aiService.generateCvDraft(req.validatedBody);
  return sendSuccess(res, 200, result);
}

export async function generateCoverLetter(req, res) {
  const result = await aiService.generateCoverLetter(req.validatedBody);
  return sendSuccess(res, 200, result);
}

export async function generateInterviewQuestions(req, res) {
  const result = await aiService.generateInterviewQuestions(req.validatedBody);
  return sendSuccess(res, 200, result);
}

export async function evaluateInterview(req, res) {
  const result = await aiService.evaluateInterview(req.validatedBody);
  return sendSuccess(res, 200, result);
}
