import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../../src/validators/auth.validator.js";
import { createPostSchema } from "../../src/validators/post.validator.js";

describe("auth.validator", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "qa@example.com",
      password: "SecurePass1!",
      name: "QA Tester",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "qa@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts login without recaptcha", () => {
    const result = loginSchema.safeParse({
      email: "qa@example.com",
      password: "password",
    });
    expect(result.success).toBe(true);
  });
});

describe("post.validator", () => {
  const baseTarget = { socialAccountId: "acc_123" };

  it("requires content or image", () => {
    const result = createPostSchema.safeParse({
      content: "",
      images: [],
      targets: [baseTarget],
    });
    expect(result.success).toBe(false);
  });

  it("accepts image-only post", () => {
    const result = createPostSchema.safeParse({
      content: "",
      images: ["https://cdn.example.com/image.jpg"],
      targets: [baseTarget],
    });
    expect(result.success).toBe(true);
  });

  it("strips # from manual hashtags on create", () => {
    const result = createPostSchema.safeParse({
      content: "Hello",
      hashtagMode: "manual",
      hashtags: ["#launch", "##saas"],
      language: "en",
      targets: [baseTarget],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hashtags).toEqual(["launch", "saas"]);
    }
  });

  it("rejects publish and schedule together", () => {
    const future = new Date(Date.now() + 3600_000).toISOString();
    const result = createPostSchema.safeParse({
      content: "Scheduled publish conflict",
      targets: [baseTarget],
      publish: true,
      scheduledFor: future,
    });
    expect(result.success).toBe(false);
  });
});
