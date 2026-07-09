import "dotenv/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const creds = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
};
const bucket = process.env.AWS_S3_BUCKET!.trim();
const key = `test-probe-${Date.now()}.txt`;

const configs = [
  { name: "eu-north-1 default", client: new S3Client({ region: "eu-north-1", credentials: creds }) },
  {
    name: "eu-north-1 no checksum",
    client: new S3Client({
      region: "eu-north-1",
      credentials: creds,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    } as ConstructorParameters<typeof S3Client>[0]),
  },
  {
    name: "us-east-1 + followRegionRedirects",
    client: new S3Client({ region: "us-east-1", credentials: creds, followRegionRedirects: true }),
  },
];

async function tryUpload(label: string, client: S3Client) {
  try {
    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: "smc-test", ContentType: "text/plain" }),
    );
    console.log(`✅ ${label}: UPLOAD OK`);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`   Cleaned up test file`);
    return true;
  } catch (e: unknown) {
    const err = e as { Code?: string; message?: string };
    console.log(`❌ ${label}: ${err.Code ?? "Error"} — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Bucket:", bucket, "| Key len:", creds.accessKeyId.length, "| Secret len:", creds.secretAccessKey.length);
  for (const { name, client } of configs) {
    const ok = await tryUpload(name, client);
    if (ok) break;
  }
}

main();
