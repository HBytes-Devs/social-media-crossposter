import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
const content = fs.readFileSync(envPath, "utf8");
const match = content.match(/AWS_SECRET_ACCESS_KEY=(.+)/);

if (match) {
  const secret = match[1].trim();
  const hasNonAscii = [...secret].some((c) => c.charCodeAt(0) > 127);
  const hasWhitespace = /\s/.test(secret);
  console.log("Secret length:", secret.length);
  console.log("Has non-ASCII:", hasNonAscii);
  console.log("Has whitespace:", hasWhitespace);
  console.log("Starts with AKIA key format OK:", /^AKIA/.test(process.env.AWS_ACCESS_KEY_ID ?? ""));
}
