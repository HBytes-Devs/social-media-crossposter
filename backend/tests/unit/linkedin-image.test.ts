import { describe, expect, it } from "vitest";
import { AppError } from "../../src/middleware/error.middleware.js";
import {
  LINKEDIN_IMAGE,
  validateLinkedInDimensions,
} from "../../src/lib/linkedin-image.js";

describe("linkedin-image", () => {
  it("exports LinkedIn dimension constants", () => {
    expect(LINKEDIN_IMAGE.minWidth).toBe(552);
    expect(LINKEDIN_IMAGE.maxBytes).toBe(8 * 1024 * 1024);
  });

  it("accepts valid 1200x800 image", () => {
    expect(() => validateLinkedInDimensions(1200, 800, "hero.jpg")).not.toThrow();
  });

  it("rejects image below minimum dimensions", () => {
    expect(() => validateLinkedInDimensions(400, 200, "small.jpg")).toThrow(AppError);
    try {
      validateLinkedInDimensions(400, 200, "small.jpg");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toContain("too small");
    }
  });

  it("rejects invalid aspect ratio", () => {
    expect(() => validateLinkedInDimensions(1200, 3000, "tall.jpg")).toThrow(AppError);
  });
});
