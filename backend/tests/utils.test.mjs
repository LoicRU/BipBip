import { afterEach, describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../src/utils/async.js";
import { sendSuccess } from "../src/utils/response.js";
import { comparePassword, hashPassword } from "../src/utils/hash.js";
import { generateToken, verifyToken } from "../src/utils/jwt.js";
import { serializeApplication, serializeOffer } from "../src/utils/serializers.js";

function createJsonResponseDouble() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("asyncHandler", () => {
  it("forwards rejected async errors to next", async () => {
    const expectedError = new Error("failure");
    const next = vi.fn();
    const wrapped = asyncHandler(async () => {
      throw expectedError;
    });

    wrapped({}, {}, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(expectedError);
  });

  it("lets successful handlers run without calling next", async () => {
    const next = vi.fn();
    const res = { done: false };
    const wrapped = asyncHandler(async (_req, response) => {
      response.done = true;
    });

    wrapped({}, res, next);
    await Promise.resolve();

    expect(res.done).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("sendSuccess", () => {
  it("returns standardized JSON payloads without meta when omitted", () => {
    const res = createJsonResponseDouble();

    sendSuccess(res, 201, { id: "job-1" });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { id: "job-1" },
    });
  });

  it("includes meta when provided", () => {
    const res = createJsonResponseDouble();

    sendSuccess(res, 200, [{ id: "job-1" }], { page: 1, total: 1 });

    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: "job-1" }],
      meta: { page: 1, total: 1 },
    });
  });
});

describe("hash utilities", () => {
  it("hashes and validates passwords", async () => {
    const password = "super-secret-password";

    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    await expect(comparePassword(password, hashed)).resolves.toBe(true);
    await expect(comparePassword("wrong-password", hashed)).resolves.toBe(false);
  });
});

describe("jwt utilities", () => {
  it("generates and verifies tokens with the expected claims", () => {
    const token = generateToken({
      id: 7,
      email: "user@test.com",
      role: { name: "user" },
    });

    const payload = verifyToken(token);

    expect(payload).toMatchObject({
      userId: 7,
      email: "user@test.com",
      role: "user",
    });
  });

  it("throws on malformed tokens", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow();
  });
});

describe("serializers", () => {
  it("normalizes legacy AI question objects into a question array", () => {
    const offer = serializeOffer({
      id: 1,
      source: "platform",
      ownerId: 2,
      status: "active",
      title: "Frontend Developer",
      description: "Description",
      companyName: "Ma Societe",
      location: "Marseille",
      contractType: "CDI",
      remoteMode: "on-site",
      salaryMin: null,
      salaryMax: null,
      publishedAt: new Date("2026-05-22T13:17:44.050Z"),
      rawPayload: {
        aiQuestions: {
          question_2: "Deuxieme question ?",
          question_1: "Premiere question ?",
          question_3: "Troisieme question ?",
        },
      },
      createdAt: new Date("2026-05-22T13:17:44.050Z"),
    });

    expect(offer.aiQuestions).toEqual([
      "Premiere question ?",
      "Deuxieme question ?",
      "Troisieme question ?",
    ]);
  });

  it("normalizes legacy AI interview question objects into renderable strings", () => {
    const application = serializeApplication({
      id: 7,
      offerId: 1,
      candidateName: "Jean Dupont",
      candidateEmail: "jean@example.com",
      candidatePhone: "",
      coverLetter: "",
      cv: "",
      status: "pending",
      aiInterview: {
        answers: [
          {
            question: {
              question_2: "Deuxieme question ?",
              question_1: "Premiere question ?",
            },
            answer: "Ma reponse.",
          },
        ],
        feedback: "Bon entretien",
      },
      createdAt: new Date("2026-05-22T13:17:44.050Z"),
      updatedAt: new Date("2026-05-22T13:17:44.050Z"),
      offer: {
        id: 1,
        source: "platform",
        ownerId: 2,
        status: "active",
        title: "Frontend Developer",
        description: "Description",
        companyName: "Ma Societe",
        location: "Marseille",
        contractType: "CDI",
        remoteMode: "on-site",
        salaryMin: null,
        salaryMax: null,
        publishedAt: new Date("2026-05-22T13:17:44.050Z"),
        rawPayload: {},
        createdAt: new Date("2026-05-22T13:17:44.050Z"),
      },
      applicant: null,
    });

    expect(application.aiInterview.answers[0].question).toBe(
      "Premiere question ?\nDeuxieme question ?"
    );
  });
});
