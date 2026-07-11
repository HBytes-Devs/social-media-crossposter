import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

const app = createApp();

describe("API smoke (integration)", () => {
  it("GET /api/v1/health returns health payload", async () => {
    const res = await request(app).get("/api/v1/health");
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject({
      status: expect.stringMatching(/ok|degraded/),
      version: expect.any(String),
    });
  });

  it("GET /api/v1/auth/config is public", async () => {
    const res = await request(app).get("/api/v1/auth/config");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("recaptchaEnabled");
  });

  it("GET /api/v1/accounts requires auth", async () => {
    const res = await request(app).get("/api/v1/accounts");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/posts/options requires auth", async () => {
    const res = await request(app).get("/api/v1/posts/options");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/accounts/linkedin/status is public", async () => {
    const res = await request(app).get("/api/v1/accounts/linkedin/status");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("configured");
  });

  it("POST /api/v1/auth/login rejects invalid body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("GET unknown route returns 404", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
  });
});
