import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { getTopicVideoById } from "@/lib/video/service";
import { getElevenLabsVoiceById } from "@/lib/video/voices";
import { getMusicTrackById } from "@/lib/video/music-tracks";

export async function updateTopicVideoPrompt(
  topicVideoId: string,
  promptJson: Record<string, unknown>,
  voiceId: string,
  musicTrackId?: string,
) {
  const existing = await getTopicVideoById(topicVideoId);
  if (!existing) {
    return { ok: false as const, error: "Topic video not found." };
  }
  const withVoice = mergeVoice(promptJson, voiceId);
  const savedPrompt = mergeMusic(withVoice, musicTrackId);

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

function mergeMusic(promptJson: Record<string, unknown>, musicTrackId: string | undefined) {
  if (musicTrackId === undefined) return promptJson;
  const trimmed = musicTrackId.trim();
  if (trimmed.length === 0) {
    const { music: _ignored, ...rest } = promptJson;
    return rest;
  }
  const track = getMusicTrackById(trimmed);
  if (!track) return promptJson;
  return {
    ...promptJson,
    music: { trackId: track.id, label: track.label },
  };
}
