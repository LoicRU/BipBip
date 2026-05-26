import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/offers/service.js", () => ({
  listOffers: vi.fn(),
  getOfferById: vi.fn(),
}));

const offersService = await import("../src/modules/offers/service.js");
const { generateToken } = await import("../src/utils/jwt.js");
const appModule = await import("../src/app.js");
const app = appModule.default;

describe("Offers routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists offers with standardized JSON", async () => {
    offersService.listOffers.mockResolvedValue({
      data: [
        {
          id: "job-1",
          title: "Backend Developer",
          companyName: "Jetdev",
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        source: "welovedevs",
      },
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/offers?page=1&limit=20",
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data[0].id).toBe("job-1");
    expect(response._getJSONData().meta.source).toBe("welovedevs");
  });

  it("returns one offer detail", async () => {
    offersService.getOfferById.mockResolvedValue({
      id: "job-1",
      title: "Backend Developer",
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/offers/job-1",
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.id).toBe("job-1");
  });

  it("forwards authenticated recruiter context when listing owned offers", async () => {
    offersService.listOffers.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 1,
        source: "database",
      },
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/offers?mine=true&page=1&limit=100",
      headers: {
        authorization: `Bearer ${generateToken({
          id: 2,
          email: "recruiter@test.com",
          role: { name: "recruiter" },
        })}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(offersService.listOffers).toHaveBeenCalledWith(
      expect.objectContaining({ mine: "true" }),
      expect.objectContaining({ userId: 2, role: "recruiter" })
    );
  });

  it("returns standardized validation errors", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/offers?page=0&limit=500",
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error.message).toBe("Validation error");
    expect(response._getJSONData().error.details.issues).toHaveLength(2);
  });
});
