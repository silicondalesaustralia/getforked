import { spawn } from "node:child_process";
import type { CaptionOverlay } from "@/lib/video/caption-images";
import { buildAudioGraph } from "@/lib/video/audio-mix";

type BaseVideoInput = {
  introPath: string;
  middlePath: string;
  outroPath: string;
  durations: number[];
  outputPath: string;
};

type FinalVideoInput = {
  baseVideoPath: string;
  audioPath: string | null;
  musicPath: string | null;
  overlays: CaptionOverlay[];
  captionHeight: number;
  height: number;
  durationSeconds: number;
  outputPath: string;
};

export async function buildBaseVideo(input: BaseVideoInput) {
  await runProcess(ffmpegPath(), [
    "-y",
    "-loop", "1", "-t", String(input.durations[0]), "-i", input.introPath,
    "-i", input.middlePath,
    "-loop", "1", "-t", String(input.durations[2]), "-i", input.outroPath,
    "-filter_complex", "[0:v][1:v][2:v]concat=n=3:v=1:a=0,format=yuv420p[v]",
    "-map", "[v]",
    "-t", String(input.durations.reduce((total, item) => total + item, 0)),
    "-an",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    input.outputPath,
  ]);
  return input.outputPath;
}

export async function buildFinalVideo(input: FinalVideoInput) {
  const captionInputs = input.overlays.flatMap((overlay) => ["-i", overlay.pngPath]);
  const audioInputs = audioInputArgs(input);
  const audio = buildAudioGraph({
    voiceIndex: input.audioPath ? 1 : null,
    musicIndex: input.musicPath ? (input.audioPath ? 2 : 1) : null,
    durationSeconds: input.durationSeconds,
  });
  const captionStartIndex = (input.audioPath ? 1 : 0) + (input.musicPath ? 1 : 0) + 1;
  const captions = captionFilter(input, captionStartIndex);
  const filters = [audio.filter, captions].filter((value) => value.length > 0);
  const filter = filters.join(";");
  const videoMap = input.overlays.length > 0 ? `[v${input.overlays.length}]` : "0:v";

  await runProcess(ffmpegPath(), [
    "-y",
    "-i", input.baseVideoPath,
    ...audioInputs,
    ...captionInputs,
    ...(filter ? ["-filter_complex", filter] : []),
    "-map", videoMap,
    ...(audio.outputLabel ? ["-map", audio.outputLabel] : []),
    "-t", String(input.durationSeconds),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    ...(audio.outputLabel ? ["-c:a", "aac"] : ["-an"]),
    input.outputPath,
  ]);
  return input.outputPath;
}

function audioInputArgs(input: FinalVideoInput) {
  const args: string[] = [];
  if (input.audioPath) args.push("-i", input.audioPath);
  if (input.musicPath) args.push("-stream_loop", "-1", "-i", input.musicPath);
  return args;
}

function captionFilter(input: FinalVideoInput, captionStartIndex: number) {
  if (input.overlays.length === 0) return "";
  const safeAreaPadding = Math.round(input.height * 0.08);
  const y = Math.max(0, input.height - input.captionHeight - safeAreaPadding);
  const filters = [`[0:v]drawbox=x=0:y=${y}:w=iw:h=${input.captionHeight}:color=black@1:t=fill[v0]`];
  input.overlays.forEach((overlay, index) => {
    const enable = `between(t\\,${overlay.startSeconds.toFixed(2)}\\,${overlay.endSeconds.toFixed(2)})`;
    filters.push(`[v${index}][${captionStartIndex + index}:v]overlay=0:${y}:enable='${enable}'[v${index + 1}]`);
  });
  return filters.join(";");
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
