import { defineConfig } from "drizzle-kit";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }
  const contents = readFileSync(filePath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}

export default defineConfig({
  schema: ["./lib/db/schema.ts", "./lib/db/marketplace-schema.ts", "./lib/db/marketplace-ops-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "",
  },
});
