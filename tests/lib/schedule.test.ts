import { describe, expect, it } from "vitest";
import { berlinDayKey, dayKey, upcomingPostDates } from "@/lib/schedule";

describe("dayKey", () => {
  it("returns the UTC day as yyyy-mm-dd", () => {
    expect(dayKey(new Date("2026-10-23T00:00:00Z"))).toBe("2026-10-23");
  });

  it("uses the UTC day, even when it is already the next day in Berlin", () => {
    expect(dayKey(new Date("2026-10-22T22:30:00Z"))).toBe("2026-10-22");
  });
});

describe("berlinDayKey", () => {
  it("counts 00:30 on Friday in Berlin as Friday in summer time (UTC+2)", () => {
    expect(berlinDayKey(new Date("2026-10-22T22:30:00Z"))).toBe("2026-10-23");
  });

  it("counts 00:30 on Friday in Berlin as Friday in winter time (UTC+1)", () => {
    expect(berlinDayKey(new Date("2026-11-12T23:30:00Z"))).toBe("2026-11-13");
  });

  it("keeps the same day in the middle of the day", () => {
    expect(berlinDayKey(new Date("2026-10-23T12:00:00Z"))).toBe("2026-10-23");
  });
});

describe("upcomingPostDates", () => {
  const keys = (from: string, count: number) =>
    upcomingPostDates(new Date(from), count).map(dayKey);

  it("starts on the first post day when called on it", () => {
    expect(keys("2026-10-16T00:00:00Z", 1)).toEqual(["2026-10-16"]);
  });

  it("skips to the next post day the day after a post", () => {
    expect(keys("2026-10-17T00:00:00Z", 1)).toEqual(["2026-10-30"]);
  });

  it("includes a post day later in the same day", () => {
    expect(keys("2026-10-30T15:00:00Z", 1)).toEqual(["2026-10-30"]);
  });

  it("returns post days two weeks apart", () => {
    expect(keys("2026-10-19T00:00:00Z", 3)).toEqual(["2026-10-30", "2026-11-13", "2026-11-27"]);
  });

  it("starts at the first post day for dates before it", () => {
    expect(keys("2026-10-01T00:00:00Z", 1)).toEqual(["2026-10-16"]);
  });
});
