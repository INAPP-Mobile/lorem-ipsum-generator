import { describe, it, expect } from "vitest";
import {
  generateParagraphs,
  generateWords,
  generateBytes,
  generateText,
} from "@/lib/lorem";

describe("generateParagraphs", () => {
  it("generates the requested number of paragraphs", () => {
    const result = generateParagraphs(3);
    const paragraphs = result.split("\n\n");
    expect(paragraphs).toHaveLength(3);
    paragraphs.forEach((p) => expect(p.length).toBeGreaterThan(10));
  });

  it("handles 1 paragraph", () => {
    const result = generateParagraphs(1);
    expect(result.split("\n\n")).toHaveLength(1);
  });

  it("handles 20 paragraphs (max)", () => {
    const result = generateParagraphs(20);
    expect(result.split("\n\n")).toHaveLength(20);
  });

  it("each paragraph starts with a capital letter", () => {
    const result = generateParagraphs(5);
    result.split("\n\n").forEach((p) => {
      expect(p[0]).toMatch(/[A-Z]/);
    });
  });

  it("each paragraph ends with a period", () => {
    const result = generateParagraphs(5);
    result.split("\n\n").forEach((p) => {
      expect(p.endsWith(".")).toBe(true);
    });
  });
});

describe("generateWords", () => {
  it("generates the requested number of words", () => {
    const result = generateWords(50);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(50);
  });

  it("handles 1 word", () => {
    const result = generateWords(1);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(1);
  });

  it("handles 1000 words", () => {
    const result = generateWords(1000);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(1000);
  });

  it("starts with a capital letter", () => {
    const result = generateWords(10);
    expect(result[0]).toMatch(/[A-Z]/);
  });

  it("ends with a period", () => {
    const result = generateWords(10);
    expect(result.endsWith(".")).toBe(true);
  });
});

describe("generateBytes", () => {
  it("generates approximately the requested number of bytes", () => {
    const result = generateBytes(500);
    const bytes = new TextEncoder().encode(result).length;
    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThanOrEqual(600);
  });

  it("handles small byte counts", () => {
    const result = generateBytes(50);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("generateText", () => {
  it("dispatches paragraphs mode correctly", () => {
    const result = generateText("paragraphs", 3);
    expect(result.split("\n\n")).toHaveLength(3);
  });

  it("dispatches words mode correctly", () => {
    const result = generateText("words", 10);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(10);
  });

  it("dispatches bytes mode correctly", () => {
    const result = generateText("bytes", 200);
    expect(result.length).toBeGreaterThan(0);
  });

  it("clamps paragraph count to max 20", () => {
    const result = generateText("paragraphs", 100);
    expect(result.split("\n\n")).toHaveLength(20);
  });

  it("clamps paragraph count to min 1", () => {
    const result = generateText("paragraphs", 0);
    expect(result.split("\n\n")).toHaveLength(1);
  });

  it("clamps words to min 1", () => {
    const result = generateText("words", 0);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(1);
  });
});
