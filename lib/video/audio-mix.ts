type AudioGraphInput = {
  voiceIndex: number | null;
  musicIndex: number | null;
  durationSeconds: number;
};

export type AudioGraph = {
  filter: string;
  outputLabel: string | null;
};

export function buildAudioGraph(input: AudioGraphInput): AudioGraph {
  if (input.voiceIndex === null && input.musicIndex === null) {
    return { filter: "", outputLabel: null };
  }

  const voiceVolume = readFloat("VIDEO_VOICE_VOLUME", 1.0);
  const musicVolume = readFloat("VIDEO_MUSIC_VOLUME", 0.08);
  const fadeOut = Math.max(0, input.durationSeconds - 1.2);

  if (input.voiceIndex !== null && input.musicIndex !== null) {
    const filter = [
      `[${input.voiceIndex}:a]volume=${voiceVolume}[voice]`,
      `[${input.musicIndex}:a]volume=${musicVolume},afade=t=out:st=${fadeOut.toFixed(2)}:d=1.2[music]`,
      `[voice][music]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]`,
    ].join(";");
    return { filter, outputLabel: "[a]" };
  }

  if (input.voiceIndex !== null) {
    const filter = `[${input.voiceIndex}:a]volume=${voiceVolume}[a]`;
    return { filter, outputLabel: "[a]" };
  }

  const filter = `[${input.musicIndex}:a]volume=${musicVolume},afade=t=out:st=${fadeOut.toFixed(2)}:d=1.2[a]`;
  return { filter, outputLabel: "[a]" };
}

function readFloat(name: string, fallback: number) {
  const value = Number.parseFloat(process.env[name] ?? "");
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}
