import { getElevenLabsVoiceById } from "@/lib/video/voices";

export type ElevenLabsAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export async function buildElevenLabsAudio(input: { script: string; voiceId: string; speed?: number }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");

  const voice = getElevenLabsVoiceById(input.voiceId);
  if (!voice) throw new Error("Selected ElevenLabs voice is not configured.");

  const voiceSettings: Record<string, number | boolean> = {
    similarity_boost: 0.75,
    stability: 0.48,
    style: 0.22,
    use_speaker_boost: true,
  };
  if (typeof input.speed === "number" && input.speed > 0) {
    voiceSettings.speed = Math.min(1.2, Math.max(0.7, input.speed));
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}/with-timestamps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      model_id: "eleven_multilingual_v2",
      text: input.script,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs audio failed: ${errorText || response.statusText}`);
  }

  const payload = await response.json() as {
    audio_base64?: string;
    alignment?: ElevenLabsAlignment;
    normalized_alignment?: ElevenLabsAlignment;
  };
  if (!payload.audio_base64) {
    throw new Error("ElevenLabs audio response did not include audio_base64.");
  }

  return {
    audio: Buffer.from(payload.audio_base64, "base64"),
    alignment: payload.normalized_alignment ?? payload.alignment ?? null,
  };
}
