import "dotenv/config";

const key = process.env.AWS_ACCESS_KEY_ID?.trim();
const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
const bucket = process.env.AWS_S3_BUCKET?.trim();

console.log("Key length:", key?.length);
console.log("Secret length:", secret?.length);
console.log("Bucket:", bucket);
console.log("Region:", process.env.AWS_REGION);
