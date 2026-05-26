import { env } from "../../config/env.js";
import { AppError } from "../../utils/error.js";

async function requestAiService(path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_SERVICE_TIMEOUT_MS);

  try {
    const response = await fetch(new URL(path, env.AI_SERVICE_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new AppError(
        502,
        data?.detail || data?.error || "AI service request failed"
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError(504, "AI service timeout");
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(502, "AI service unavailable");
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateCvDraft(input) {
  return requestAiService("/internal/ai/cv", input);
}

export async function generateCoverLetter(input) {
  return requestAiService("/internal/ai/cover-letter", input);
}

export async function generateInterviewQuestions(input) {
  return requestAiService("/internal/ai/interview/questions", input);
}

export async function evaluateInterview(input) {
  return requestAiService("/internal/ai/interview/evaluate", input);
}
