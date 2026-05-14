import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { getTopicVideoById } from "@/lib/video/service";
import { getElevenLabsVoiceById } from "@/lib/video/voices";

export async function updateTopicVideoPrompt(topicVideoId: string, promptJson: Record<string, unknown>, voiceId: string) {
  const existing = await getTopicVideoById(topicVideoId);
  if (!existing) {
    return { ok: false as const, error: "Topic video not found." };
  }
  const savedPrompt = mergeVoice(promptJson, voiceId);

  await getDb()
    .update(topicVideos)
    .set({
      promptJson: savedPrompt,
      renderConfigJson: mergeRenderConfig(existing.renderConfigJson, savedPrompt),
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, topicVideoId));

  return { ok: true as const };
}

function mergeRenderConfig(existing: unknown, promptJson: Record<string, unknown>) {
  if (typeof existing !== "object" || existing === null) {
    return promptJson;
  }
  return {
    ...existing,
    ...promptJson,
  };
}

function mergeVoice(promptJson: Record<string, unknown>, voiceId: string) {
  const voice = getElevenLabsVoiceById(voiceId);
  if (!voice) return promptJson;
  const existingVoiceover = typeof promptJson.voiceover === "object" && promptJson.voiceover !== null ? promptJson.voiceover : {};
  return {
    ...promptJson,
    voiceover: {
      ...existingVoiceover,
      provider: "elevenlabs",
      voiceId: voice.id,
      voiceLabel: voice.label,
    },
  };
}
