import { describe, expect, it } from "vitest";
import { mapWeloveDevsJobToOffer } from "../src/modules/ingestion/welovedevs.mapper.js";

describe("mapWeloveDevsJobToOffer", () => {
  it("maps a complete payload", () => {
    const result = mapWeloveDevsJobToOffer({
      id: "job-1",
      title: "Developpeur Java / Spring",
      description: "Long description",
      contractTypes: ["permanent"],
      publishDate: 1777537452918000,
      formattedPlaces: ["Villeneuve-d'Ascq, France"],
      details: {
        salary: {
          min: 36,
          max: 55,
          recurrence: "year",
        },
        remotePolicy: {
          frequency: "hybrid",
        },
      },
      smallCompany: {
        companyName: "Jetdev",
      },
    });

    expect(result.externalId).toBe("job-1");
    expect(result.title).toBe("Developpeur Java / Spring");
    expect(result.companyName).toBe("Jetdev");
    expect(result.remoteMode).toBe("hybrid");
    expect(result.salaryMin).toBe(36000);
    expect(result.salaryMax).toBe(55000);
  });

  it("annualizes daily salaries", () => {
    const result = mapWeloveDevsJobToOffer({
      id: "job-3",
      title: "Lead developpeur",
      details: {
        salary: {
          min: 555,
          max: 579,
          maxPerYear: 116,
          recurrence: "day",
        },
      },
    });

    expect(result.salaryMin).toBe(111192);
    expect(result.salaryMax).toBe(116000);
  });

  it("falls back to preview and placeholders", () => {
    const result = mapWeloveDevsJobToOffer({
      objectID: "job-2",
      descriptionPreview: "Short preview",
    });

    expect(result.externalId).toBe("job-2");
    expect(result.description).toBe("Short preview");
    expect(result.companyName).toBe("Unknown company");
    expect(result.location).toBe("Unknown location");
    expect(result.contractType).toBe("unknown");
  });
});
