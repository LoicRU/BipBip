import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/support/service.js", () => ({
  createSupportTicket: vi.fn(),
  listSupportTickets: vi.fn(),
  resolveSupportTicket: vi.fn(),
}));

const appModule = await import("../src/app.js");
const app = appModule.default;
const supportService = await import("../src/modules/support/service.js");
const { generateToken } = await import("../src/utils/jwt.js");

function createToken(roleName) {
  return generateToken({
    id: roleName === "admin" ? 2 : 1,
    email: `${roleName}@test.com`,
    role: { name: roleName },
  });
}

describe("Support routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a tech user to create a support ticket", async () => {
    supportService.createSupportTicket.mockResolvedValue({ id: "ticket-1" });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/support/tickets",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
      body: {
        subject: "Aide",
        description: "J'ai un probleme",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData().data.id).toBe("ticket-1");
  });

  it("validates support ticket payload", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/support/tickets",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
      body: {
        subject: "",
        description: "ok",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error).toBe("Validation error");
  });

  it("rejects non-admin support listing", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/support/tickets",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response._getJSONData().error).toBe("Forbidden");
  });

  it("allows an admin to list support tickets", async () => {
    supportService.listSupportTickets.mockResolvedValue([{ id: "ticket-1" }]);

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/support/tickets",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data).toHaveLength(1);
  });

  it("allows an admin to resolve a support ticket", async () => {
    supportService.resolveSupportTicket.mockResolvedValue({
      id: "ticket-1",
      status: "resolved",
    });

    const response = await invokeApp(app, {
      method: "PATCH",
      url: "/api/support/tickets/1/resolve",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.status).toBe("resolved");
  });
});
