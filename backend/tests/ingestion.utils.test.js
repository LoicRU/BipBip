import { describe, expect, it } from "vitest";
import {
  normalizeInteger,
  normalizeNullableString,
  normalizeSalaryRange,
  toDateFromWeloveDevsTimestamp,
} from "../src/modules/ingestion/ingestion.utils.js";

describe("ingestion utils", () => {
  it("normalizes nullable strings", () => {
    expect(normalizeNullableString("  hello  ")).toBe("hello");
    expect(normalizeNullableString("   ")).toBeNull();
    expect(normalizeNullableString(null)).toBeNull();
  });

  it("normalizes integers", () => {
    expect(normalizeInteger(42)).toBe(42);
    expect(normalizeInteger("36")).toBe(36);
    expect(normalizeInteger(undefined)).toBeNull();
    expect(normalizeInteger("not-a-number")).toBeNull();
  });

  it("normalizes yearly salaries to annual euros", () => {
    expect(
      normalizeSalaryRange({
        min: 36,
        max: 55,
        recurrence: "year",
      })
    ).toEqual({
      min: 36000,
      max: 55000,
    });
  });

  it("normalizes daily salaries using annual equivalent", () => {
    expect(
      normalizeSalaryRange({
        min: 555,
        max: 579,
        maxPerYear: 116,
        recurrence: "day",
      })
    ).toEqual({
      min: 111192,
      max: 116000,
    });
  });

  it("converts WeLoveDevs timestamps", () => {
    expect(
      toDateFromWeloveDevsTimestamp(1777537452918000)?.toISOString()
    ).toBe("2026-04-30T08:24:12.918Z");
    expect(toDateFromWeloveDevsTimestamp(null)).toBeNull();
  });
});
