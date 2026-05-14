export type ElevenLabsVoiceOption = {
  id: string;
  label: string;
  group: "custom" | "female" | "male";
};

export function getElevenLabsVoiceOptions() {
  if (process.env.ELEVENLABS_VOICE_IDS) {
    return readVoiceList(process.env.ELEVENLABS_VOICE_IDS, "custom");
  }
  return [
    ...readVoiceList(process.env.ELEVENLABS_AU_FEMALE_VOICES, "female"),
    ...readVoiceList(process.env.ELEVENLABS_AU_MALE_VOICES, "male"),
  ];
}

export function getDefaultElevenLabsVoice() {
  return getElevenLabsVoiceOptions()[0] ?? null;
}

export function getElevenLabsVoiceById(id: string) {
  return getElevenLabsVoiceOptions().find((voice) => voice.id === id) ?? null;
}

function readVoiceList(value: string | undefined, group: ElevenLabsVoiceOption["group"]) {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id, index) => ({
      id,
      label: group === "custom" ? `Voice ${index + 1}` : `AU ${group} ${index + 1}`,
      group,
    }));
}
