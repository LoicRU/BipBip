import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/favorites/service.js", () => ({
  listFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

const appModule = await import("../src/app.js");
const app = appModule.default;
const favoritesService = await import("../src/modules/favorites/service.js");
const { generateToken } = await import("../src/utils/jwt.js");

const token = generateToken({
  id: 1,
  email: "tech@test.com",
  role: { name: "tech" },
});

describe("Favorites routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated favorites listing", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/favorites",
    });

    expect(response.statusCode).toBe(401);
  });

  it("lists favorite offers for an authenticated user", async () => {
    favoritesService.listFavorites.mockResolvedValue([{ id: "job-1" }]);

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/favorites",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data[0].id).toBe("job-1");
  });

  it("adds a favorite offer", async () => {
    favoritesService.addFavorite.mockResolvedValue({ id: "job-2" });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/favorites/job-2",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData().data.id).toBe("job-2");
  });

  it("removes a favorite offer", async () => {
    favoritesService.removeFavorite.mockResolvedValue({ success: true });

    const response = await invokeApp(app, {
      method: "DELETE",
      url: "/api/favorites/job-2",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.success).toBe(true);
  });
});
