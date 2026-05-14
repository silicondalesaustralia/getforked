import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { buildCaptionsFromScript } from "@/lib/video/captions";
import { buildLandingPageVideoContext } from "@/lib/video/landing-page-context";
import { getDefaultElevenLabsVoice } from "@/lib/video/voices";
import type { LandingPageVideoContext } from "@/lib/video/context-types";

type SlideCopy = {
  s1: { eyebrow: string; title: string; subtitle: string };
  s2: { title: string; body: string };
  s3: { title: string; points: string[] };
  s4: { title: string; ctaLabel: string; ctaUrl: string };
};

export async function renderTopicVideo(topicVideoId: string) {
  const db = getDb();
  const rows = await db.select().from(topicVideos).where(eq(topicVideos.id, topicVideoId));
  const video = rows[0];
  if (!video) throw new Error("Topic video not found.");

  const context = resolveContext(video.sourceType, video.sourceId, video.topicContextJson);
  const voiceover = buildVoiceover(context);
  const slideCopy = buildSlideCopy(context);
  const captions = buildCaptionsFromScript(voiceover.script, voiceover.durationSeconds);
  const snapshot = buildSnapshot(context, slideCopy, voiceover, captions, topicVideoId);

  await db
    .update(topicVideos)
    .set({
      topicContextJson: context,
      promptJson: { slideCopy, voiceover, captions },
      renderConfigJson: snapshot,
      primaryVideoUrl: snapshot.render.variants[0]?.videoUrl ?? null,
      primaryThumbnailUrl: snapshot.render.variants[0]?.thumbnailUrl ?? null,
      status: "ready_for_review",
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(topicVideos.id, topicVideoId));

  return snapshot;
}

function resolveContext(sourceType: string, sourceId: string, existing: unknown): LandingPageVideoContext {
  if (isContext(existing)) return existing;
  return buildLandingPageVideoContext(sourceType, sourceId);
}

function buildSlideCopy(context: LandingPageVideoContext): SlideCopy {
  return {
    s1: { eyebrow: context.brand.name, title: context.h1, subtitle: "Tools you own, not rent." },
    s2: { title: "The GetForked model", body: "We build tools you own, not rent. The SaaS tax is real." },
    s3: { title: "Get matched", points: ["Matched with a human developer", "Scoped for speed and cost", "Built around your workflow"] },
    s4: { title: "Own the workflow", ctaLabel: context.cta.label, ctaUrl: context.cta.url },
  };
}

function buildVoiceover(context: LandingPageVideoContext) {
  const voice = getDefaultElevenLabsVoice();
  return {
    script: buildCtaScript(context),
    source: "fallback",
    provider: voice ? "elevenlabs" : "none",
    voiceId: voice?.id,
    voiceLabel: voice?.label,
    durationSeconds: 15,
  };
}

function buildSnapshot(
  context: LandingPageVideoContext,
  slideCopy: SlideCopy,
  voiceover: ReturnType<typeof buildVoiceover>,
  captions: ReturnType<typeof buildCaptionsFromScript>,
  id: string,
) {
  const base = `/api/admin/topic-videos/${id}/asset`;
  return {
    context,
    slideCopy,
    voiceover,
    captions,
    music: { provider: "fallback", sourceFilename: "silent-professional-bed" },
    mediaProcessing: {
      ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
      ffprobePath: process.env.FFPROBE_PATH || "ffprobe",
      plannedSteps: ["probe voiceover duration", "mix voiceover with music", "extract thumbnails", "burn styled captions"],
    },
    render: {
      template: "landing_page_slides_v1",
      fps: 30,
      durationSeconds: 15,
      variants: [
        { key: "landscape_16_9", width: 1920, height: 1080, videoUrl: `${base}/landscape.mp4`, thumbnailUrl: `${base}/landscape.jpg`, customThumbnailUrl: `${base}/landscape-custom.jpg` },
        { key: "vertical_9_16", width: 1080, height: 1920, videoUrl: `${base}/vertical.mp4`, thumbnailUrl: `${base}/vertical.jpg`, customThumbnailUrl: `${base}/vertical-custom.jpg` },
      ],
    },
  };
}

function buildCtaScript(context: LandingPageVideoContext) {
  const opening = context.sourceType === "zapier"
    ? `Zapier and ${topicLabel(context.sourceId)} workflows not working as expected?`
    : `Need ${context.h1.replace(/\?$/, "")}?`;
  return [
    opening,
    "At GetForked, we build tools you own, not rent. The SaaS tax is real.",
    "We match your task with the best human developer in our system, fast and cost effective for today's environment.",
    "Get in touch with GetForked today.",
  ].join(" ");
}

function topicLabel(sourceId: string) {
  return sourceId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isContext(value: unknown): value is LandingPageVideoContext {
  return typeof value === "object" && value !== null && "sourceId" in value && "pageUrl" in value && "cta" in value;
}
