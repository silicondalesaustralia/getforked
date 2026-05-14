import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildElevenLabsAudio } from "@/lib/video/elevenlabs-audio";
import { capturePageScreenshot } from "@/lib/video/page-screenshot";
import { probeMediaDuration } from "@/lib/video/ffmpeg";
import { writeSlideImage } from "@/lib/video/preview-bitmap";
import { applySlideOverlay } from "@/lib/video/preview-overlays";
import { asRecord, stringValue } from "@/lib/video/preview-text";
import { slideDurations, syncedDuration } from "@/lib/video/preview-timing";

type SlideCopy = {
  s1: { eyebrow: string; title: string; subtitle: string };
  s2: { title: string; body: string };
};

type PreviewVariant = {
  name: "landscape" | "vertical";
  width: number;
  height: number;
};

const variants: Record<PreviewVariant["name"], PreviewVariant> = {
  landscape: { name: "landscape", width: 1920, height: 1080 },
  vertical: { name: "vertical", width: 1080, height: 1920 },
};

export async function getPreviewVideo(input: { topicVideoId: string; renderConfig: unknown; variant: string }) {
  const variantName = input.variant.replace(/\.mp4$/i, "");
  if (variantName !== "landscape" && variantName !== "vertical") {
    throw new Error("Unsupported preview variant.");
  }

  const slideCopy = readSlideCopy(input.renderConfig);
  const voiceover = readVoiceover(input.renderConfig);
  const pageUrl = readPageUrl(input.renderConfig);
  const variant = variants[variantName];
  const dir = path.join(process.cwd(), ".next", "cache", "video-previews", input.topicVideoId);
  const outputPath = path.join(dir, `${variant.name}.mp4`);
  const audioPath = path.join(dir, "voiceover.mp3");

  await mkdir(dir, { recursive: true });
  const screenshotPath = pageUrl ? await capturePageScreenshot({ pageUrl, outputPath: path.join(dir, "page-screenshot.png") }) : null;
  const slides = buildSlides(slideCopy);
  const slidePaths = await Promise.all(
    slides.map(async (slide, index) => {
      const basePath = path.join(dir, `${variant.name}-${index + 1}.ppm`);
      const slidePath = path.join(dir, `${variant.name}-${index + 1}.png`);
      await writeSlideImage(basePath, { ...slide, width: variant.width, height: variant.height });
      return applySlideOverlay({ basePath, outputPath: slidePath, kind: slide.kind, width: variant.width, height: variant.height, cacheDir: dir, middleImagePath: screenshotPath });
    }),
  );
  const audio = await ensureVoiceoverAudio(voiceover, audioPath);
  const duration = syncedDuration(audio?.durationSeconds);
  await renderMp4(slidePaths, outputPath, audio?.path ?? null, duration);
  return readFile(outputPath);
}

function readSlideCopy(value: unknown): SlideCopy {
  const root = asRecord(value);
  const slideCopy = asRecord(root.slideCopy);
  return {
    s1: {
      eyebrow: stringValue(asRecord(slideCopy.s1).eyebrow, "GetForked"),
      title: stringValue(asRecord(slideCopy.s1).title, "Own the workflow"),
      subtitle: stringValue(asRecord(slideCopy.s1).subtitle, "Reduce the SaaS tax with a focused custom build."),
    },
    s2: {
      title: stringValue(asRecord(slideCopy.s2).title, "The workflow problem"),
      body: stringValue(asRecord(slideCopy.s2).body, "Manual handoffs, brittle tools, and generic automations create avoidable work."),
    },
  };
}

function readVoiceover(value: unknown) {
  const root = asRecord(value);
  const voiceover = asRecord(root.voiceover);
  return {
    script: stringValue(voiceover.script, ""),
    voiceId: stringValue(voiceover.voiceId, ""),
  };
}

function readPageUrl(value: unknown) {
  return stringValue(asRecord(asRecord(value).context).pageUrl, "");
}

function buildSlides(slides: SlideCopy) {
  return [
    { kind: "intro" as const, title: "GetForked", body: "Own the workflow", footer: "GetForked" },
    { kind: "middle" as const, title: slides.s1.title, body: slides.s2.body, footer: "Reduce the SaaS tax" },
    { kind: "outro" as const, title: "GetForked", body: "Visit GetForked.dev", footer: "Visit GetForked.dev" },
  ];
}

async function ensureVoiceoverAudio(voiceover: { script: string; voiceId: string }, audioPath: string) {
  if (!voiceover.script || !voiceover.voiceId) return null;
  const audio = await buildElevenLabsAudio({ script: voiceover.script, voiceId: voiceover.voiceId });
  await writeFile(audioPath, audio);
  const duration = await probeMediaDuration(audioPath);
  return { path: audioPath, durationSeconds: duration.durationSeconds };
}

function renderMp4(slidePaths: string[], outputPath: string, audioPath: string | null, duration: number) {
  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  const durations = slideDurations(duration).map(String);
  const imageInputs = slidePaths.flatMap((slidePath, index) => ["-loop", "1", "-t", durations[index] ?? "4", "-i", slidePath]);
  const audioInput = audioPath ? ["-i", audioPath] : ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100"];
  return runProcess(ffmpeg, [
    "-y",
    ...imageInputs,
    ...audioInput,
    "-filter_complex",
    "[0:v][1:v][2:v]concat=n=3:v=1:a=0,format=yuv420p[v]",
    "-map",
    "[v]",
    "-map",
    "3:a",
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    outputPath,
  ]);
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

