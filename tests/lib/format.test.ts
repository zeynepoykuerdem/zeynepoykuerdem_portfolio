import { describe, expect, it } from "vitest";
import { shortDate } from "@/lib/format";

describe("shortDate", () => {
  it("formats a date like 15 Oct 2026", () => {
    expect(shortDate("2026-10-15T12:00:00Z")).toBe("15 Oct 2026");
  });

  it("uses the Berlin day, not the UTC day", () => {
    expect(shortDate("2026-10-22T22:30:00Z")).toBe("23 Oct 2026");
  });
});
