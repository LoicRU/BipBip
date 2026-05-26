import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/ai/service.js", () => ({
  generateCvDraft: vi.fn(),
  generateCoverLetter: vi.fn(),
  generateInterviewQuestions: vi.fn(),
  evaluateInterview: vi.fn(),
}));

const aiService = await import("../src/modules/ai/service.js");
const { generateToken } = await import("../src/utils/jwt.js");
const appModule = await import("../src/app.js");
const app = appModule.default;

function createToken(role = "tech") {
  return generateToken({
    id: 1,
    email: "ia@test.com",
    role: { name: role },
  });
}

describe("AI routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated AI requests", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/cv",
      body: {
        name: "Jean Dupont",
        email: "jean@example.com",
        title: "Developpeur",
        experience: "Experience detaillee sur plusieurs projets.",
        skills: "React, Node.js",
        education: "Master informatique",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });

  it("returns validation errors for invalid CV payloads", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/cv",
      headers: {
        authorization: `Bearer ${createToken()}`,
      },
      body: {
        name: "J",
        email: "bad",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error).toBe("Validation error");
  });

  it("returns generated interview questions", async () => {
    aiService.generateInterviewQuestions.mockResolvedValue({
      provider: "fallback",
      model: null,
      questions: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"],
    });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/interview/questions",
      headers: {
        authorization: `Bearer ${createToken("recruiter")}`,
      },
      body: {
        title: "Frontend Developer",
        description: "Nous cherchons une personne autonome avec une forte culture React.",
        requirements: ["React", "TypeScript"],
        experience: "3 ans",
        company: "Tech Corp",
        type: "CDI",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(aiService.generateInterviewQuestions).toHaveBeenCalledWith({
      title: "Frontend Developer",
      description: "Nous cherchons une personne autonome avec une forte culture React.",
      requirements: ["React", "TypeScript"],
      experience: "3 ans",
      company: "Tech Corp",
      type: "CDI",
    });
    expect(response._getJSONData().data.questions).toHaveLength(5);
  });

  it("returns evaluated interview payload", async () => {
    aiService.evaluateInterview.mockResolvedValue({
      provider: "ollama",
      model: "qwen2.5:0.5b",
      score: 86,
      feedback: "Bon niveau technique et bonnes explications.",
      strengths: ["Bonne maitrise de React"],
      weaknesses: ["Peut donner plus d'exemples concrets"],
      summary: "Entretien prometteur.",
    });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/interview/evaluate",
      headers: {
        authorization: `Bearer ${createToken()}`,
      },
      body: {
        title: "Frontend Developer",
        description: "Description complete du poste React et TypeScript.",
        requirements: ["React", "TypeScript"],
        answers: [
          {
            question: "Quelle est votre experience avec React ?",
            answer: "J'utilise React en production depuis 4 ans.",
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.score).toBe(86);
    expect(response._getJSONData().data.feedback).toContain("Bon niveau");
  });

  it("returns validation errors for invalid cover letter payloads", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/cover-letter",
      headers: {
        authorization: `Bearer ${createToken()}`,
      },
      body: {
        name: "J",
        company: "",
        position: "",
        motivation: "trop court",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error).toBe("Validation error");
  });

  it("returns generated cover letter", async () => {
    aiService.generateCoverLetter.mockResolvedValue({
      provider: "fallback",
      model: null,
      letter: "Dear Hiring Manager, ...",
    });

    const payload = {
      name: "Jean Dupont",
      title: "Développeur Full Stack",
      company: "Tech Corp",
      position: "Frontend Developer",
      motivation: "Je suis motivé par ce poste car...",
      skills: "React, Node.js",
      experience: "3 ans",
      education: "Master Informatique",
    };

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/ai/cover-letter",
      headers: {
        authorization: `Bearer ${createToken()}`,
      },
      body: payload,
    });

    expect(response.statusCode).toBe(200);
    expect(aiService.generateCoverLetter).toHaveBeenCalledWith(payload);
    expect(response._getJSONData().data.letter).toContain("Dear");
  });
});
