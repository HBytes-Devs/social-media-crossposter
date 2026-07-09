import "dotenv/config";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_S3_BUCKET!;
const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1", "eu-north-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2",
  "me-south-1", "me-central-1", "af-south-1",
];

async function findRegion() {
  for (const region of regions) {
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      console.log(`✅ Bucket found in region: ${region}`);
      return region;
    } catch {
      // try next
    }
  }

  console.log("❌ Could not find bucket region");
}

findRegion();
