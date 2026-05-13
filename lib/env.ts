type AwsEnvKey = "AWS_REGION" | "AWS_S3_BUCKET" | "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY";

const requiredAwsKeys: AwsEnvKey[] = ["AWS_REGION", "AWS_S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];

function readEnv() {
  return {
    databaseUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
    nextAuthUrl: process.env.NEXTAUTH_URL ?? "",
    awsRegion: process.env.AWS_REGION ?? "",
    awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  };
}

export const env = readEnv();

function assertKeysPresent(keys: string[]) {
  const missing: string[] = [];
  for (const key of keys) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export function assertDatabaseEnv() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error("Missing environment variable: set DATABASE_URL or POSTGRES_URL.");
  }
}

export function assertAwsEnv() {
  assertKeysPresent(requiredAwsKeys);
}
