import { afterEach, describe, expect, it, vi } from "vitest";
import {
  evaluateInterview,
  generateCvDraft,
  generateInterviewQuestions,
} from "../src/modules/ai/service.js";
import { AppError } from "../src/utils/error.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("AI service proxy", () => {
  it("forwards CV generation to the Python AI service", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        provider: "ollama",
        model: "qwen2.5:0.5b",
        content: "CV généré",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const payload = {
      name: "Jean Dupont",
      email: "jean@example.com",
      phone: "0600000000",
      title: "Developpeur Full Stack",
      experience: "5 ans d'experience sur des applications web.",
      skills: "React, Node.js, TypeScript",
      education: "Master informatique",
    };

    const result = await generateCvDraft(payload);

    expect(result.content).toBe("CV généré");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toContain("/internal/ai/cv");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(payload);
  });

  it("forwards interview question generation to the Python AI service", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          provider: "fallback",
          model: null,
          questions: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"],
        }),
      })
    );

    const result = await generateInterviewQuestions({
      title: "Frontend Developer",
      description: "Projet React et TypeScript avec forte exigence de qualite.",
      requirements: ["React", "TypeScript"],
      experience: "3 ans",
      company: "Tech Corp",
      type: "CDI",
    });

    expect(result.questions).toHaveLength(5);
    expect(result.provider).toBe("fallback");
  });

  it("raises a gateway-style error when the AI service is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"))
    );

    await expect(
      evaluateInterview({
        title: "Frontend Developer",
        description: "Description complete du poste React et TypeScript.",
        requirements: ["React", "TypeScript"],
        answers: [
          {
            question: "Parlez-nous de React",
            answer: "J'utilise React au quotidien depuis plusieurs annees.",
          },
        ],
      })
    ).rejects.toMatchObject(new AppError(502, "AI service unavailable"));
  });
});
