import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import { invokeApp } from "./test-helpers.mjs";

describe("GET /health", () => {
  it("returns backend health status", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData()).toEqual({ status: "ok" });
  });

  it("returns standardized 404 errors", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response._getJSONData().error.message).toBe("Route not found");
  });
});
