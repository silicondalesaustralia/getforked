import { spawn } from "node:child_process";
import { rename, writeFile } from "node:fs/promises";
import { buildElevenLabsAudio, type ElevenLabsAlignment } from "@/lib/video/elevenlabs-audio";
import { probeMediaDuration } from "@/lib/video/ffmpeg";

const ELEVEN_MAX_SPEED = 1.2;
const MIN_SPEED = 0.7;
const MAX_SPEED = 2.0;

export function getVoiceoverSpeed() {
  const raw = Number.parseFloat(process.env.VIDEO_VOICEOVER_SPEED ?? "1");
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, raw));
}

export async function prepareVoiceoverAudio(input: { script: string; voiceId: string; outputPath: string }) {
  const targetSpeed = getVoiceoverSpeed();
  const elevenSpeed = Math.min(ELEVEN_MAX_SPEED, targetSpeed);
  const result = await buildElevenLabsAudio({ script: input.script, voiceId: input.voiceId, speed: elevenSpeed });
  await writeFile(input.outputPath, result.audio);

  const tempoFactor = targetSpeed / elevenSpeed;
  if (tempoFactor > 1.001) {
    const tempPath = `${input.outputPath}.raw.mp3`;
    await rename(input.outputPath, tempPath);
    await applyAtempo({ inputPath: tempPath, outputPath: input.outputPath, factor: tempoFactor });
  }

  const duration = await probeMediaDuration(input.outputPath);
  return {
    path: input.outputPath,
    durationSeconds: duration.durationSeconds,
    alignment: scaleAlignment(result.alignment, tempoFactor),
  };
}

function scaleAlignment(alignment: ElevenLabsAlignment | null, tempoFactor: number) {
  if (!alignment || tempoFactor <= 1.001) return alignment;
  const divisor = tempoFactor;
  return {
    characters: alignment.characters,
    character_start_times_seconds: alignment.character_start_times_seconds.map((value) => value / divisor),
    character_end_times_seconds: alignment.character_end_times_seconds.map((value) => value / divisor),
  } satisfies ElevenLabsAlignment;
}

async function applyAtempo(input: { inputPath: string; outputPath: string; factor: number }) {
  const filter = atempoChain(input.factor).map((value) => `atempo=${value.toFixed(4)}`).join(",");
  await runProcess(ffmpegPath(), [
    "-y",
    "-i",
    input.inputPath,
    "-filter:a",
    filter,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    input.outputPath,
  ]);
}

function atempoChain(factor: number) {
  const steps: number[] = [];
  let remaining = factor;
  while (remaining > 2) {
    steps.push(2);
    remaining = remaining / 2;
  }
  while (remaining < 0.5) {
    steps.push(0.5);
    remaining = remaining / 0.5;
  }
  steps.push(remaining);
  return steps;
}

function ffmpegPath() {
  return process.env.FFMPEG_PATH || "ffmpeg";
}

function runProcess(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      code === 0 ? resolve() : reject(new Error(`${command} failed with code ${code}: ${stderr}`));
    });
  });
}
