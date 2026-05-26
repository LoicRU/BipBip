import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  offer: {
    create: vi.fn(),
  },
};

vi.mock("../src/lib/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/modules/api/api_get.js", () => ({
  getJobById: vi.fn(),
  getJobsPage: vi.fn(),
}));

const offersService = await import("../src/modules/offers/service.js");

describe("offers service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a platform offer without requiring companyName in the payload", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 4,
      name: "Ma Societe",
      email: "recruiter@example.com",
      role: { name: "recruiter" },
    });

    prismaMock.offer.create.mockResolvedValue({
      id: 42,
      externalId: "offer-42",
      source: "platform",
      ownerId: 4,
      status: "active",
      title: "Frontend Developpeur",
      description: "Developer plusieurs apps et sites en react",
      companyName: "Ma Societe",
      location: "Marseille, France",
      contractType: "CDI",
      remoteMode: "on-site",
      salaryMin: 3000000,
      salaryMax: 6000000,
      publishedAt: new Date("2026-05-22T13:17:44.050Z"),
      rawPayload: {
        requirements: ["react"],
        benefits: [],
        experience: "aucun",
        hasAiTest: true,
        aiQuestions: ["Question 1"],
        skills: ["react"],
        company: "Ma Societe",
      },
      createdAt: new Date("2026-05-22T13:17:44.050Z"),
    });

    await offersService.createOffer(
      {
        title: "Frontend Developpeur",
        type: "CDI",
        location: "Marseille, France",
        remote: false,
        salary: "3000 - 6000",
        experience: "aucun",
        description: "Developer plusieurs apps et sites en react",
        requirements: ["react"],
        benefits: [],
        hasAiTest: true,
        aiQuestions: ["Question 1"],
      },
      {
        userId: 4,
        role: "recruiter",
        email: "recruiter@example.com",
      }
    );

    expect(prismaMock.offer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyName: "Ma Societe",
        }),
      })
    );
  });
});
