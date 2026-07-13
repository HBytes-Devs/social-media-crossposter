import crypto from "node:crypto";
import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";

const router = Router();

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function parseSignedRequest(
  signedRequest: string,
  secret: string,
): { user_id?: string } | null {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = base64UrlDecode(encodedSig);
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest();
  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
    return null;
  }

  return JSON.parse(base64UrlDecode(payload).toString("utf8")) as { user_id?: string };
}

router.post("/data-deletion", async (req, res) => {
  const signedRequest = req.body?.signed_request as string | undefined;
  if (!signedRequest || !env.META_APP_SECRET) {
    res.status(400).json({ error: "Missing signed_request or META_APP_SECRET" });
    return;
  }

  const data = parseSignedRequest(signedRequest, env.META_APP_SECRET);
  if (!data?.user_id) {
    res.status(400).json({ error: "Invalid signed request" });
    return;
  }

  const facebookUserId = data.user_id;
  const confirmationCode = crypto.randomBytes(6).toString("hex");
  const statusUrl = `${env.API_BASE_URL}/api/v1/meta/data-deletion/status?code=${confirmationCode}`;

  await prisma.socialAccount.deleteMany({
    where: {
      platform: "FACEBOOK",
      metadata: {
        path: ["facebookUserId"],
        equals: facebookUserId,
      },
    },
  });

  res.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  });
});

router.get("/data-deletion/status", (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Data deletion request</title></head>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem;line-height:1.6">
  <h1>Data deletion request received</h1>
  <p>Your request has been recorded${code ? ` (confirmation: <strong>${code}</strong>)` : ""}.</p>
  <p>We remove Facebook connection data stored in Social Media Crossposter. If you need full account deletion, email
  <a href="mailto:haseebcodejourney@gmail.com">haseebcodejourney@gmail.com</a>.</p>
</body></html>`);
});

export default router;
