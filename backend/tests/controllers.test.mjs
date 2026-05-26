import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/auth/auth.service.js", () => ({
  register: vi.fn(),
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  deleteCurrentUser: vi.fn(),
}));

vi.mock("../src/modules/offers/service.js", () => ({
  listOffers: vi.fn(),
  getOfferById: vi.fn(),
}));

vi.mock("../src/modules/admin/service.js", () => ({
  getAdminDashboard: vi.fn(),
  getAdminSourcePreview: vi.fn(),
  getAdminSourceStatus: vi.fn(),
  listUsers: vi.fn(),
  updateUserStatus: vi.fn(),
}));

vi.mock("../src/modules/applications/service.js", () => ({
  createApplication: vi.fn(),
  listMyApplications: vi.fn(),
  removeMyApplication: vi.fn(),
  listRecruiterApplications: vi.fn(),
  updateApplicationStatus: vi.fn(),
}));

vi.mock("../src/modules/favorites/service.js", () => ({
  listFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

vi.mock("../src/modules/support/service.js", () => ({
  createSupportTicket: vi.fn(),
  listSupportTickets: vi.fn(),
  resolveSupportTicket: vi.fn(),
}));

vi.mock("../src/modules/reports/service.js", () => ({
  createReport: vi.fn(),
  listReports: vi.fn(),
  resolveReport: vi.fn(),
  deleteReport: vi.fn(),
}));

const authService = await import("../src/modules/auth/auth.service.js");
const offersService = await import("../src/modules/offers/service.js");
const adminService = await import("../src/modules/admin/service.js");
const applicationsService = await import("../src/modules/applications/service.js");
const favoritesService = await import("../src/modules/favorites/service.js");
const supportService = await import("../src/modules/support/service.js");
const reportsService = await import("../src/modules/reports/service.js");
const authController = await import("../src/modules/auth/auth.controller.js");
const offersController = await import("../src/modules/offers/controller.js");
const adminController = await import("../src/modules/admin/controller.js");
const applicationsController = await import("../src/modules/applications/controller.js");
const favoritesController = await import("../src/modules/favorites/controller.js");
const supportController = await import("../src/modules/support/controller.js");
const reportsController = await import("../src/modules/reports/controller.js");

function createJsonResponseDouble() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe("controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register returns 201 with the created user", async () => {
    authService.register.mockResolvedValue({ id: 1, email: "new@test.com" });
    const req = {
      validatedBody: { email: "new@test.com", password: "password123" },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    await authController.register(req, res, next);

    expect(authService.register).toHaveBeenCalledWith(req.validatedBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { id: 1, email: "new@test.com" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("login forwards service errors to next", async () => {
    const expectedError = new Error("Invalid credentials");
    authService.login.mockRejectedValue(expectedError);
    const req = {
      body: { email: "bad@test.com", password: "wrong" },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expectedError);
  });

  it("me fetches the current user from req.user", async () => {
    authService.getCurrentUser.mockResolvedValue({
      id: 5,
      email: "me@test.com",
    });
    const req = {
      user: { userId: 5 },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    await authController.me(req, res, next);

    expect(authService.getCurrentUser).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith({
      data: { id: 5, email: "me@test.com" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("updateMe persists the current user profile", async () => {
    authService.updateCurrentUser.mockResolvedValue({
      id: 5,
      name: "Ma Societe",
      email: "contact@ma-societe.test",
    });
    const req = {
      user: { userId: 5 },
      validatedBody: {
        name: "Ma Societe",
        email: "contact@ma-societe.test",
      },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    await authController.updateMe(req, res, next);

    expect(authService.updateCurrentUser).toHaveBeenCalledWith(5, req.validatedBody);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        id: 5,
        name: "Ma Societe",
        email: "contact@ma-societe.test",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deleteMe deletes the current user account", async () => {
    authService.deleteCurrentUser.mockResolvedValue({ success: true });
    const req = {
      user: { userId: 9 },
      validatedBody: { password: "password123" },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    await authController.deleteMe(req, res, next);

    expect(authService.deleteCurrentUser).toHaveBeenCalledWith(9, "password123");
    expect(res.json).toHaveBeenCalledWith({
      data: { success: true },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("listOffers returns data with pagination meta", async () => {
    offersService.listOffers.mockResolvedValue({
      data: [{ id: "job-1" }],
      meta: { page: 2, limit: 10, total: 11, totalPages: 2, source: "database" },
    });
    const req = {
      validatedQuery: { page: 2, limit: 10, q: "backend" },
    };
    const res = createJsonResponseDouble();

    await offersController.listOffers(req, res);

    expect(offersService.listOffers).toHaveBeenCalledWith(req.validatedQuery);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: "job-1" }],
      meta: { page: 2, limit: 10, total: 11, totalPages: 2, source: "database" },
    });
  });

  it("getOfferById returns a single standardized payload", async () => {
    offersService.getOfferById.mockResolvedValue({ id: "job-2", title: "Backend" });
    const req = {
      validatedParams: { id: "job-2" },
    };
    const res = createJsonResponseDouble();

    await offersController.getOfferById(req, res);

    expect(offersService.getOfferById).toHaveBeenCalledWith("job-2");
    expect(res.json).toHaveBeenCalledWith({
      data: { id: "job-2", title: "Backend" },
    });
  });

  it("getSourcePreview returns standardized admin preview data", async () => {
    adminService.getAdminSourcePreview.mockResolvedValue({
      source: "welovedevs",
      totalAvailable: 3,
      preview: [{ id: "job-1" }],
    });
    const res = createJsonResponseDouble();

    await adminController.getSourcePreview({}, res);

    expect(adminService.getAdminSourcePreview).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        source: "welovedevs",
        totalAvailable: 3,
        preview: [{ id: "job-1" }],
      },
    });
  });

  it("getSourceStatus returns standardized admin status data", async () => {
    adminService.getAdminSourceStatus.mockResolvedValue({
      source: "welovedevs",
      status: "reachable",
      totalAvailable: 42,
    });
    const res = createJsonResponseDouble();

    await adminController.getSourceStatus({}, res);

    expect(adminService.getAdminSourceStatus).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        source: "welovedevs",
        status: "reachable",
        totalAvailable: 42,
      },
    });
  });

  it("createApplication returns the created application", async () => {
    applicationsService.createApplication.mockResolvedValue({ id: "1" });
    const req = {
      validatedBody: { offerId: "job-1" },
      user: { userId: 3, role: "tech" },
    };
    const res = createJsonResponseDouble();

    await applicationsController.createApplication(req, res);

    expect(applicationsService.createApplication).toHaveBeenCalledWith(
      req.validatedBody,
      req.user,
      undefined
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("listFavorites returns favorite offers", async () => {
    favoritesService.listFavorites.mockResolvedValue([{ id: "offer-1" }]);
    const req = { user: { userId: 4 } };
    const res = createJsonResponseDouble();

    await favoritesController.listFavorites(req, res);

    expect(favoritesService.listFavorites).toHaveBeenCalledWith(req.user);
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: "offer-1" }] });
  });

  it("createSupportTicket returns the created ticket", async () => {
    supportService.createSupportTicket.mockResolvedValue({ id: "ticket-1" });
    const req = {
      validatedBody: { subject: "Bug", description: "Details" },
      user: { userId: 1, role: "tech" },
    };
    const res = createJsonResponseDouble();

    await supportController.createSupportTicket(req, res);

    expect(supportService.createSupportTicket).toHaveBeenCalledWith(
      req.validatedBody,
      req.user
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("createReport returns the created report", async () => {
    reportsService.createReport.mockResolvedValue({ id: "report-1" });
    const req = {
      validatedBody: { type: "job", jobId: "job-1", reason: "Spam" },
      user: { userId: 8, role: "recruiter" },
    };
    const res = createJsonResponseDouble();

    await reportsController.createReport(req, res);

    expect(reportsService.createReport).toHaveBeenCalledWith(
      req.validatedBody,
      req.user
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("getSummary returns dashboard metrics", async () => {
    adminService.getAdminDashboard.mockResolvedValue({
      users: { total: 10 },
    });
    const res = createJsonResponseDouble();

    await adminController.getSummary({}, res);

    expect(adminService.getAdminDashboard).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        users: { total: 10 },
      },
    });
  });
});
