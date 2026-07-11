/**
 * QA smoke test — run against a live backend:
 *   npx tsx scripts/qa-smoke.ts
 *   API_BASE=http://localhost:3001 npx tsx scripts/qa-smoke.ts
 */
import "dotenv/config";

const API_BASE = process.env.API_BASE ?? process.env.API_BASE_URL ?? "http://localhost:3001";
const API = `${API_BASE.replace(/\/$/, "")}/api/v1`;

type Check = {
  phase: string;
  name: string;
  pass: boolean;
  detail: string;
};

const checks: Check[] = [];

function record(phase: string, name: string, pass: boolean, detail: string) {
  checks.push({ phase, name, pass, detail });
  const icon = pass ? "PASS" : "FAIL";
  console.log(`[${icon}] ${phase} › ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, init);
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  console.log(`\nSMC QA Smoke — ${API}\n${"=".repeat(50)}\n`);

  // Phase 1: Environment / connectivity
  try {
    const { res, body } = await fetchJson("/health");
    record(
      "Smoke",
      "Health endpoint",
      res.ok,
      `status=${res.status} db=${body?.data?.database ?? "unknown"}`,
    );
  } catch (err) {
    record("Smoke", "Health endpoint", false, err instanceof Error ? err.message : "unreachable");
  }

  try {
    const { res, body } = await fetchJson("/auth/config");
    record(
      "Smoke",
      "Auth config",
      res.ok && body?.success === true,
      `recaptcha=${body?.data?.recaptchaEnabled}`,
    );
  } catch (err) {
    record("Smoke", "Auth config", false, err instanceof Error ? err.message : "failed");
  }

  try {
    const { res, body } = await fetchJson("/accounts/linkedin/status");
    record(
      "Smoke",
      "LinkedIn OAuth configured",
      res.ok,
      `configured=${body?.data?.configured}`,
    );
  } catch (err) {
    record("Smoke", "LinkedIn OAuth configured", false, "failed");
  }

  // Phase 2: Security
  try {
    const { res } = await fetchJson("/accounts");
    record("Security", "Accounts requires auth", res.status === 401, `status=${res.status}`);
  } catch (err) {
    record("Security", "Accounts requires auth", false, "failed");
  }

  try {
    const { res } = await fetchJson("/posts", { method: "GET" });
    record("Security", "Posts list requires auth", res.status === 401, `status=${res.status}`);
  } catch (err) {
    record("Security", "Posts list requires auth", false, "failed");
  }

  // Phase 3: Data (optional — needs DB + credentials via env)
  const qaEmail = process.env.QA_EMAIL;
  const qaPassword = process.env.QA_PASSWORD;

  if (qaEmail && qaPassword) {
    try {
      const { res, body } = await fetchJson("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: qaEmail, password: qaPassword }),
      });
      const token = body?.data?.token as string | undefined;
      record("Functional", "Login", res.ok && Boolean(token), res.ok ? qaEmail : body?.error ?? body?.message);

      if (token) {
        const auth = { headers: { Authorization: `Bearer ${token}` } };

        const accountsRes = await fetchJson("/accounts", auth);
        const accounts = accountsRes.body?.data?.accounts ?? [];
        const linkedIn = accounts.find((a: { platform: string }) => a.platform === "LINKEDIN");
        record(
          "Functional",
          "LinkedIn connected",
          Boolean(linkedIn),
          linkedIn ? (linkedIn as { accountName?: string }).accountName ?? "connected" : "not connected",
        );

        const previewRes = await fetchJson("/posts/preview", {
          method: "POST",
          headers: { ...auth.headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "QA smoke test post",
            hashtagMode: "auto",
            hashtags: [],
            language: "en",
            images: [],
          }),
        });
        record(
          "Functional",
          "Post preview",
          previewRes.res.ok,
          previewRes.res.ok ? "preview OK" : previewRes.body?.error ?? previewRes.body?.message,
        );
      }
    } catch (err) {
      record("Functional", "Authenticated flows", false, err instanceof Error ? err.message : "failed");
    }
  } else {
    record(
      "Functional",
      "Authenticated flows",
      true,
      "skipped — set QA_EMAIL and QA_PASSWORD to run",
    );
  }

  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${checks.length} total\n`);

  if (failed > 0) process.exit(1);
}

main();
