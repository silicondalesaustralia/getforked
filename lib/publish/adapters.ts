import type { PublishInput, PublishPlatform, PublishResult } from "@/lib/publish/types";
import { getChannelAccessToken } from "@/lib/social/credentials";

export async function publishToPlatform(platform: PublishPlatform, input: PublishInput) {
  if (!input.videoUrl || !input.title) {
    return { ok: false, error: "Missing publish payload fields." };
  }
  try {
    if (platform === "youtube") return publishJsonEndpoint("YOUTUBE_PUBLISH_ENDPOINT", "youtube", input);
    if (platform === "facebook") return publishJsonEndpoint("FACEBOOK_PUBLISH_ENDPOINT", "facebook", input);
    if (platform === "instagram") return publishJsonEndpoint("INSTAGRAM_PUBLISH_ENDPOINT", "instagram", input);
    if (platform === "tiktok") return publishJsonEndpoint("TIKTOK_PUBLISH_ENDPOINT", "tiktok", input);
    return publishJsonEndpoint("TWITTER_PUBLISH_ENDPOINT", "twitter", input);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unexpected publish adapter error." };
  }
}

async function publishJsonEndpoint(endpointEnv: string, channel: string, input: PublishInput): Promise<PublishResult> {
  const endpoint = process.env[endpointEnv];
  const token = await getChannelAccessToken(channel);
  if (!endpoint || !token) {
    return { ok: false, error: `Missing ${endpointEnv} or ${channel} credentials. Connect the channel before publishing.` };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const text = await response.text();
  if (!response.ok) {
    return { ok: false, error: text || `Publish failed with status ${response.status}.` };
  }
  const payload = parsePayload(text);
  return {
    ok: true,
    platformPostId: stringField(payload, "id") || stringField(payload, "postId"),
    externalUrl: stringField(payload, "url") || stringField(payload, "externalUrl"),
  };
}

function parsePayload(text: string): Record<string, unknown> {
  if (!text.trim()) return {};
  const parsed = JSON.parse(text) as unknown;
  return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {};
}

function stringField(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}
