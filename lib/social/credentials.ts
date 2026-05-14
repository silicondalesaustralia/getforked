import { createDecipheriv } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { socialChannelCredentials } from "@/lib/db/schema";

export async function getChannelAccessToken(channel: string) {
  const envToken = process.env[`${channel.toUpperCase()}_ACCESS_TOKEN`];
  if (envToken) return envToken;

  const rows = await getDb()
    .select()
    .from(socialChannelCredentials)
    .where(eq(socialChannelCredentials.channel, channel))
    .orderBy(desc(socialChannelCredentials.updatedAt))
    .limit(1);
  const credential = rows[0];
  if (!credential) return null;
  return decryptToken(credential.accessTokenEncrypted);
}

function decryptToken(value: string) {
  const key = process.env.SOCIAL_TOKEN_ENC_KEY;
  if (!key) throw new Error("SOCIAL_TOKEN_ENC_KEY is required to decrypt social credentials.");
  const [ivHex, tagHex, encryptedHex] = value.split(":");
  if (!ivHex || !tagHex || !encryptedHex) throw new Error("Encrypted social token is malformed.");
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]).toString("utf8");
}
