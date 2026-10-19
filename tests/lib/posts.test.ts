import { describe, expect, it } from "vitest";
import { excerpt, readingTime, shortHash } from "@/lib/posts";

describe("shortHash", () => {
  it("returns the first 7 characters", () => {
    expect(shortHash("3f2a9c1e-0000-4000-8000-000000000000")).toBe("3f2a9c1");
  });
});

describe("excerpt", () => {
  it("returns an empty string for blank text", () => {
    expect(excerpt("   \n  ")).toBe("");
  });

  it("returns short text unchanged, with whitespace collapsed", () => {
    expect(excerpt("Hello\n\n  world")).toBe("Hello world");
  });

  it("cuts long text at the last space and adds an ellipsis", () => {
    expect(excerpt("one two three four", 10)).toBe("one two…");
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(excerpt("one two, three four", 9)).toBe("one two…");
  });

  it("cuts mid-word only when there is no space", () => {
    expect(excerpt("abcdefghijkl", 5)).toBe("abcde…");
  });
});

describe("readingTime", () => {
  it("returns an empty string for an empty body", () => {
    expect(readingTime("  ")).toBe("");
  });

  it("rounds up to at least one minute", () => {
    expect(readingTime("a few words")).toBe("1 min read");
  });

  it("uses 200 words per minute", () => {
    expect(readingTime(Array(201).fill("word").join(" "))).toBe("2 min read");
  });
});
