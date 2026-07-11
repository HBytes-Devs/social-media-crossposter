import { describe, expect, it } from "vitest";
import {
  buildFinalContent,
  generateAutoHashtags,
  normalizeHashtags,
  previewPostContent,
  resolveHashtags,
} from "./hashtags.js";

describe("frontend hashtags", () => {
  it("normalizeHashtags matches backend behavior", () => {
    expect(normalizeHashtags(["#Launch", "launch"])).toEqual(["launch"]);
  });

  it("generateAutoHashtags detects linkedin keywords", () => {
    const tags = generateAutoHashtags("Cross-posting to LinkedIn and social media", "en");
    expect(tags).toContain("linkedin");
    expect(tags).toContain("socialmedia");
  });

  it("resolveHashtags none mode", () => {
    expect(resolveHashtags("none", ["ignored"], "hello", "en")).toEqual([]);
  });

  it("previewPostContent builds final string", () => {
    const result = previewPostContent({
      content: "Good afternoon!",
      hashtagMode: "manual",
      hashtags: ["social", "communication"],
      language: "en",
    });
    expect(result.finalContent).toBe("Good afternoon!\n\n#social #communication");
  });

  it("buildFinalContent handles empty body", () => {
    expect(buildFinalContent("", ["tag"])).toBe("#tag");
  });
});
