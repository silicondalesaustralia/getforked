import { spawn } from "node:child_process";

export type MediaDuration = {
  durationSeconds: number | null;
};

const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";

export async function probeMediaDuration(inputPath: string): Promise<MediaDuration> {
  const output = await runProcess(ffprobePath, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    inputPath,
  ]);
  const duration = Number(output.trim());
  return { durationSeconds: Number.isFinite(duration) ? duration : null };
}

export async function mixVoiceoverWithMusic(input: {
  voiceoverPath: string;
  musicPath: string;
  outputPath: string;
  durationSeconds: number;
  voiceVolume?: number;
  musicVolume?: number;
}) {
  const voiceVolume = String(input.voiceVolume ?? Number(process.env.VIDEO_VOICE_VOLUME || 1.15));
  const musicVolume = String(input.musicVolume ?? Number(process.env.VIDEO_MUSIC_VOLUME || 0.18));

  await runProcess(ffmpegPath, [
    "-y",
    "-i",
    input.musicPath,
    "-i",
    input.voiceoverPath,
    "-filter_complex",
    `[0:a]volume=${musicVolume},atrim=0:${input.durationSeconds}[music];[1:a]volume=${voiceVolume},adelay=800|800[voice];[music][voice]amix=inputs=2:duration=longest,alimiter=limit=0.95[out]`,
    "-map",
    "[out]",
    "-t",
    String(input.durationSeconds),
    input.outputPath,
  ]);
}

export async function extractVideoThumbnail(input: { videoPath: string; outputPath: string; atSeconds?: number }) {
  await runProcess(ffmpegPath, [
    "-y",
    "-ss",
    String(input.atSeconds ?? 2),
    "-i",
    input.videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    input.outputPath,
  ]);
}

async function runProcess(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(`${command} failed with code ${code}: ${stderr || stdout}`));
    });
  });
}
