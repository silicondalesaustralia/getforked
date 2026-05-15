import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { renderCaptionImages } from "@/lib/video/caption-images";
import { buildCaptionFrames } from "@/lib/video/caption-timeline";
import { buildMiddleClip } from "@/lib/video/middle-clip";
import { getMusicTrackById } from "@/lib/video/music-tracks";
import { capturePageScreenshot } from "@/lib/video/page-screenshot";
import { buildBaseVideo, buildFinalVideo } from "@/lib/video/preview-compose";
import { writeSlideImage } from "@/lib/video/preview-bitmap";
import { applySlideOverlay } from "@/lib/video/preview-overlays";
import { asRecord, stringValue } from "@/lib/video/preview-text";
import { slideDurations, syncedDuration } from "@/lib/video/preview-timing";
import { prepareVoiceoverAudio } from "@/lib/video/voiceover-speed";

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

  const voiceover = readVoiceover(input.renderConfig);
  const pageUrl = readPageUrl(input.renderConfig);
  const musicPath = readMusicPath(input.renderConfig);
  const variant = variants[variantName];
  const dir = path.join(process.cwd(), ".next", "cache", "video-previews", input.topicVideoId);
  const outputPath = path.join(dir, `${variant.name}.mp4`);
  const baseVideoPath = path.join(dir, `${variant.name}-base.mp4`);
  const middleClipPath = path.join(dir, `${variant.name}-middle.mp4`);
  const audioPath = path.join(dir, "voiceover.mp3");

  await mkdir(dir, { recursive: true });
  const screenshotPath = pageUrl
    ? await capturePageScreenshot({
        pageUrl,
        outputPath: path.join(dir, `page-screenshot-${variant.name}.png`),
        orientation: variant.name,
      })
    : null;
  const audio = await ensureVoiceoverAudio(voiceover, audioPath);
  const duration = syncedDuration(audio?.durationSeconds);
  const durations = slideDurations(duration);
  const introPath = await buildStillSlide("intro", variant, dir);
  const outroPath = await buildStillSlide("outro", variant, dir);
  const middleFallback = await buildStillSlide("middle", variant, dir);
  await buildMiddleClip({
    screenshotPath,
    fallbackImagePath: middleFallback,
    outputPath: middleClipPath,
    width: variant.width,
    height: variant.height,
    orientation: variant.name,
    durationSeconds: durations[1] ?? 8,
  });
  await buildBaseVideo({ introPath, middlePath: middleClipPath, outroPath, durations, outputPath: baseVideoPath });
  const captionFrames = voiceover.script ? buildCaptionFrames({ script: voiceover.script, alignment: audio?.alignment ?? null, durationSeconds: duration }) : [];
  const captions = await renderCaptionImages({ frames: captionFrames, dir, width: variant.width, height: variant.height });
  await buildFinalVideo({ baseVideoPath, audioPath: audio?.path ?? null, musicPath, overlays: captions.overlays, captionHeight: captions.height, height: variant.height, durationSeconds: duration, outputPath });
  return readFile(outputPath);
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

function readMusicPath(value: unknown) {
  const trackId = stringValue(asRecord(asRecord(value).music).trackId, "");
  if (!trackId) return null;
  return getMusicTrackById(trackId)?.filePath ?? null;
}

async function buildStillSlide(kind: "intro" | "middle" | "outro", variant: PreviewVariant, dir: string) {
  const basePath = path.join(dir, `${variant.name}-${kind}.ppm`);
  const outputPath = path.join(dir, `${variant.name}-${kind}.png`);
  await writeSlideImage(basePath, { kind, width: variant.width, height: variant.height });
  return applySlideOverlay({ basePath, outputPath, kind, width: variant.width, height: variant.height, cacheDir: dir });
}

async function ensureVoiceoverAudio(voiceover: { script: string; voiceId: string }, audioPath: string) {
  if (!voiceover.script || !voiceover.voiceId) return null;
  return prepareVoiceoverAudio({ script: voiceover.script, voiceId: voiceover.voiceId, outputPath: audioPath });
}

