import { getElevenLabsVoiceById } from "@/lib/video/voices";

export async function buildElevenLabsAudio(input: { script: string; voiceId: string }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");

  const voice = getElevenLabsVoiceById(input.voiceId);
  if (!voice) throw new Error("Selected ElevenLabs voice is not configured.");

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      model_id: "eleven_multilingual_v2",
      text: input.script,
      voice_settings: { similarity_boost: 0.75, stability: 0.48, style: 0.22, use_speaker_boost: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs audio failed: ${errorText || response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
