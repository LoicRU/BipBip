import { describe, expect, it } from "vitest";
import { invokeApp } from "./test-helpers.mjs";
const appModule = await import("../src/app.js");
const app = appModule.default;

describe("Auth routes", () => {
  it("rejects invalid register payload", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/auth/register",
      body: {
        name: "A",
        email: "bad-email",
        password: "123",
        role: "admin",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error).toBe("Validation error");
  });

  it("rejects missing token on /auth/me", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/auth/me",
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });

  it("rejects missing token on PATCH /auth/me", async () => {
    const response = await invokeApp(app, {
      method: "PATCH",
      url: "/auth/me",
      body: {
        name: "Entreprise",
        email: "contact@entreprise.test",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });

  it("rejects missing token on DELETE /auth/me", async () => {
    const response = await invokeApp(app, {
      method: "DELETE",
      url: "/auth/me",
      body: {
        password: "password123",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });
});
