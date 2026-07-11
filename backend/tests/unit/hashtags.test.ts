import { describe, expect, it } from "vitest";
import {
  buildFinalContent,
  formatHashtagLine,
  generateAutoHashtags,
  normalizeHashtags,
  previewPost,
  resolveHashtags,
} from "../../src/services/hashtags.service.js";

describe("hashtags.service", () => {
  describe("normalizeHashtags", () => {
    it("strips # prefix and deduplicates", () => {
      expect(normalizeHashtags(["#Launch", "launch", "  #SaaS  "])).toEqual(["launch", "saas"]);
    });

    it("preserves non-latin tags", () => {
      expect(normalizeHashtags(["#برمجة", "برمجة"])).toEqual(["برمجة"]);
    });
  });

  describe("generateAutoHashtags", () => {
    it("detects tech keywords", () => {
      const tags = generateAutoHashtags("Building with Node.js and React today", "en");
      expect(tags).toContain("nodejs");
      expect(tags).toContain("react");
    });

    it("detects conversation patterns", () => {
      const tags = generateAutoHashtags("Good morning everyone!", "en");
      expect(tags).toContain("morning");
      expect(tags).toContain("greetings");
    });

    it("respects max tag count", () => {
      const tags = generateAutoHashtags(
        "nodejs typescript react aws docker kubernetes ai machine learning build in public",
        "en",
      );
      expect(tags.length).toBeLessThanOrEqual(5);
    });
  });

  describe("resolveHashtags", () => {
    it("returns empty for NONE mode", () => {
      expect(resolveHashtags("NONE", ["manual"], "hello", "en")).toEqual([]);
    });

    it("uses manual tags in MANUAL mode", () => {
      expect(resolveHashtags("MANUAL", ["#foo", "bar"], "ignored", "en")).toEqual(["foo", "bar"]);
    });

    it("auto-generates in AUTO mode", () => {
      const tags = resolveHashtags("AUTO", [], "LinkedIn social media crossposter", "en");
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe("buildFinalContent", () => {
    it("appends hashtag line with blank line separator", () => {
      expect(buildFinalContent("Hello world", ["launch", "saas"])).toBe(
        "Hello world\n\n#launch #saas",
      );
    });

    it("returns only hashtags when body is empty", () => {
      expect(buildFinalContent("  ", ["launch"])).toBe("#launch");
    });
  });

  describe("formatHashtagLine", () => {
    it("returns empty string for no tags", () => {
      expect(formatHashtagLine([])).toBe("");
    });
  });

  describe("previewPost", () => {
    it("returns final content with auto hashtags", () => {
      const result = previewPost({
        content: "Shipping our social media API",
        hashtagMode: "AUTO",
        hashtags: [],
        language: "en",
      });
      expect(result.hashtags.length).toBeGreaterThan(0);
      expect(result.finalContent).toContain("Shipping our social media API");
      expect(result.finalContent).toContain("#");
    });
  });
});
