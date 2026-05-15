import { buildElevenLabsAudio } from "@/lib/video/elevenlabs-audio";
import { getTopicVideoById } from "@/lib/video/service";

export async function buildVoicePreview(input: { topicVideoId: string; voiceId: string }) {
  const video = await getTopicVideoById(input.topicVideoId);
  if (!video?.promptJson) throw new Error("Video script not found.");

  const script = readScript(video.promptJson);
  const result = await buildElevenLabsAudio({ script, voiceId: input.voiceId });
  return result.audio;
}

function readScript(value: unknown) {
  if (typeof value !== "object" || value === null) {
    throw new Error("Prompt JSON is invalid.");
  }
  const voiceover = "voiceover" in value ? value.voiceover : null;
  if (typeof voiceover !== "object" || voiceover === null || !("script" in voiceover)) {
    throw new Error("Prompt JSON is missing voiceover.script.");
  }
  const script = voiceover.script;
  if (typeof script !== "string" || !script.trim()) {
    throw new Error("Voiceover script is empty.");
  }
  return script.trim();
}
