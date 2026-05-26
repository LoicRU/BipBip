import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/api/api_get.js", () => ({
  getJobsPage: vi.fn(),
}));

const apiModule = await import("../src/modules/api/api_get.js");
const adminService = await import("../src/modules/admin/service.js");

describe("admin service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps preview jobs with sensible fallbacks", async () => {
    apiModule.getJobsPage.mockResolvedValue({
      totalCount: 2,
      values: [
        {
          id: "job-1",
          title: "Backend Developer",
          smallCompany: { companyName: "Jetdev" },
        },
        {
          objectID: "job-2",
        },
      ],
    });

    const result = await adminService.getAdminSourcePreview();

    expect(apiModule.getJobsPage).toHaveBeenCalledWith({ page: 0, size: 5 });
    expect(result).toEqual({
      source: "welovedevs",
      totalAvailable: 2,
      preview: [
        {
          id: "job-1",
          title: "Backend Developer",
          companyName: "Jetdev",
        },
        {
          id: "job-2",
          title: "Untitled offer",
          companyName: "Unknown company",
        },
      ],
    });
  });

  it("reports source status from the remote count", async () => {
    apiModule.getJobsPage.mockResolvedValue({
      totalCount: 1784,
      values: [],
    });

    const result = await adminService.getAdminSourceStatus();

    expect(apiModule.getJobsPage).toHaveBeenCalledWith({ page: 0, size: 1 });
    expect(result).toEqual({
      source: "welovedevs",
      status: "reachable",
      totalAvailable: 1784,
    });
  });
});
