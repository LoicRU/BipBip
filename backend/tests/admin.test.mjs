import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/admin/service.js", () => ({
  getAdminDashboard: vi.fn(),
  getAdminSourcePreview: vi.fn(),
  getAdminSourceStatus: vi.fn(),
  listUsers: vi.fn(),
  updateUserStatus: vi.fn(),
}));

const adminService = await import("../src/modules/admin/service.js");
const jwtModule = await import("../src/utils/jwt.js");
const { generateToken } = jwtModule;

function createToken(roleName) {
  return generateToken({
    id: roleName === "admin" ? 2 : 1,
    email: `${roleName}@test.com`,
    role: { name: roleName },
  });
}

describe("Admin routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing token", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/dashboard",
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });

  it("rejects non-admin token", async () => {
    const token = generateToken({
      id: 1,
      email: "user@test.com",
      role: { name: "user" },
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/dashboard",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response._getJSONData().error).toBe("Forbidden");
  });

  it("accepts admin token", async () => {
    const token = generateToken({
      id: 2,
      email: "admin@test.com",
      role: { name: "admin" },
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/dashboard",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().message).toBe("Admin only");
  });

  it("returns source status for admin", async () => {
    adminService.getAdminSourceStatus.mockResolvedValue({
      source: "welovedevs",
      status: "reachable",
      totalAvailable: 1784,
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/source-status",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.status).toBe("reachable");
  });

  it("returns source preview for admin", async () => {
    adminService.getAdminSourcePreview.mockResolvedValue({
      source: "welovedevs",
      totalAvailable: 1784,
      preview: [{ id: "job-1", title: "Backend Developer" }],
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/offers-preview",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.preview[0].id).toBe("job-1");
  });

  it("returns admin summary for admin", async () => {
    adminService.getAdminDashboard.mockResolvedValue({
      users: { total: 12, active: 10, pending: 1, blocked: 1 },
    });

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/summary",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.users.total).toBe(12);
  });

  it("returns users list for admin", async () => {
    adminService.listUsers.mockResolvedValue([
      { id: 1, email: "tech@test.com", type: "tech", status: "active" },
    ]);

    const response = await invokeApp(app, {
      method: "GET",
      url: "/admin/users",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data[0].email).toBe("tech@test.com");
  });

  it("updates a user status for admin", async () => {
    adminService.updateUserStatus.mockResolvedValue({
      id: 1,
      status: "blocked",
    });

    const response = await invokeApp(app, {
      method: "PATCH",
      url: "/admin/users/1/status",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
      body: {
        status: "blocked",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.status).toBe("blocked");
  });
});
