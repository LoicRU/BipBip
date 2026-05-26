import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/reports/service.js", () => ({
  createReport: vi.fn(),
  listReports: vi.fn(),
  resolveReport: vi.fn(),
  deleteReport: vi.fn(),
}));

const appModule = await import("../src/app.js");
const app = appModule.default;
const reportsService = await import("../src/modules/reports/service.js");
const { generateToken } = await import("../src/utils/jwt.js");

function createToken(roleName) {
  return generateToken({
    id: roleName === "admin" ? 3 : 1,
    email: `${roleName}@test.com`,
    role: { name: roleName },
  });
}

describe("Reports routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a recruiter to create a report", async () => {
    reportsService.createReport.mockResolvedValue({ id: "report-1" });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/reports",
      headers: {
        authorization: `Bearer ${createToken("recruiter")}`,
      },
      body: {
        type: "job",
        jobId: "job-1",
        reason: "Spam",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData().data.id).toBe("report-1");
  });

  it("validates report payload", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/reports",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
      body: {
        reason: "Spam",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error).toBe("Validation error");
  });

  it("rejects non-admin report listing", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/reports",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response._getJSONData().error).toBe("Forbidden");
  });

  it("allows an admin to list reports", async () => {
    reportsService.listReports.mockResolvedValue([{ id: "report-1" }]);

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/reports",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data).toHaveLength(1);
  });

  it("allows an admin to resolve and delete reports", async () => {
    reportsService.resolveReport.mockResolvedValue({
      id: "report-1",
      status: "resolved",
    });
    reportsService.deleteReport.mockResolvedValue({ success: true });

    const resolveResponse = await invokeApp(app, {
      method: "PATCH",
      url: "/api/reports/1/resolve",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    const deleteResponse = await invokeApp(app, {
      method: "DELETE",
      url: "/api/reports/1",
      headers: {
        authorization: `Bearer ${createToken("admin")}`,
      },
    });

    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse._getJSONData().data.status).toBe("resolved");
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse._getJSONData().data.success).toBe(true);
  });
});
