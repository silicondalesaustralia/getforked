import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env, assertDatabaseEnv } from "@/lib/env";

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  assertDatabaseEnv();
  const sql = neon(env.databaseUrl);
  cachedDb = drizzle({ client: sql });
  return cachedDb;
}
