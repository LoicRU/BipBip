import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeApp } from "./test-helpers.mjs";

vi.mock("../src/modules/applications/service.js", () => ({
  createApplication: vi.fn(),
  listMyApplications: vi.fn(),
  removeMyApplication: vi.fn(),
  listRecruiterApplications: vi.fn(),
  updateApplicationStatus: vi.fn(),
  getApplicationCv: vi.fn(),
}));

const appModule = await import("../src/app.js");
const app = appModule.default;
const applicationsService = await import("../src/modules/applications/service.js");
const { generateToken } = await import("../src/utils/jwt.js");

function createToken(roleName) {
  return generateToken({
    id: roleName === "recruiter" ? 2 : 1,
    email: `${roleName}@test.com`,
    role: { name: roleName },
  });
}

describe("Applications routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a tech user to create an application", async () => {
    applicationsService.createApplication.mockResolvedValue({ id: "app-1" });

    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/applications",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
      body: {
        offerId: "job-1",
        coverLetter: "Je postule",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData().data.id).toBe("app-1");
  });

  it("rejects a recruiter trying to create an application", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/applications",
      headers: {
        authorization: `Bearer ${createToken("recruiter")}`,
      },
      body: {
        offerId: "job-1",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response._getJSONData().error).toBe("Forbidden");
  });

  it("validates the application payload", async () => {
    const response = await invokeApp(app, {
      method: "POST",
      url: "/api/applications",
      headers: {
        authorization: `Bearer ${createToken("tech")}`,
      },
      body: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData().error.message).toBe("Validation error");
  });

  it("allows a recruiter to list received applications", async () => {
    applicationsService.listRecruiterApplications.mockResolvedValue([
      { id: "app-1" },
    ]);

    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/applications/recruiter",
      headers: {
        authorization: `Bearer ${createToken("recruiter")}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data).toHaveLength(1);
  });

  it("allows a recruiter to update an application status", async () => {
    applicationsService.updateApplicationStatus.mockResolvedValue({
      id: "app-1",
      status: "accepted",
    });

    const response = await invokeApp(app, {
      method: "PATCH",
      url: "/api/applications/1/status",
      headers: {
        authorization: `Bearer ${createToken("recruiter")}`,
      },
      body: {
        status: "accepted",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData().data.status).toBe("accepted");
  });

  it("requires authentication to download an application CV", async () => {
    const response = await invokeApp(app, {
      method: "GET",
      url: "/api/applications/1/cv",
    });

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData().error).toBe("Unauthorized");
  });
});
