import type { PublishInput, PublishPlatform, PublishResult } from "@/lib/publish/types";

async function publishStub(platform: PublishPlatform, input: PublishInput): Promise<PublishResult> {
  try {
    if (!input.videoUrl || !input.title) {
      return { ok: false, error: "Missing publish payload fields." };
    }

    return {
      ok: true,
      platformPostId: `${platform}_${Date.now()}`,
    };
  } catch {
    return { ok: false, error: "Unexpected publish adapter error." };
  }
}

export async function publishToPlatform(platform: PublishPlatform, input: PublishInput) {
  return publishStub(platform, input);
}
