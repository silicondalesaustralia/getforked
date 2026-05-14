import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { buildLandingPageVideoContext } from "@/lib/video/landing-page-context";
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
  const slideCopy = buildSlideCopy(context);
  const voiceover = buildVoiceover(slideCopy);
  const snapshot = buildSnapshot(context, slideCopy, voiceover, topicVideoId);

  await db
    .update(topicVideos)
    .set({
      topicContextJson: context,
      promptJson: { slideCopy, voiceover },
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
    s1: { eyebrow: context.brand.name, title: clamp(context.h1, 84), subtitle: clamp(context.heroSummary, 140) },
    s2: { title: "The workflow problem", body: clamp(context.painPoints[0] ?? context.heroSummary, 180) },
    s3: { title: "What changes", points: context.benefits.slice(0, 3).map((item) => clamp(item, 90)) },
    s4: { title: "Own the workflow", ctaLabel: context.cta.label, ctaUrl: context.cta.url },
  };
}

function buildVoiceover(slides: SlideCopy) {
  return {
    script: `${slides.s1.title}. ${slides.s2.body} ${slides.s3.title}: ${slides.s3.points.join(", ")}. ${slides.s4.ctaLabel}.`,
    source: "fallback",
    provider: "none",
    durationSeconds: 24,
  };
}

function buildSnapshot(context: LandingPageVideoContext, slideCopy: SlideCopy, voiceover: ReturnType<typeof buildVoiceover>, id: string) {
  const base = `/api/admin/topic-videos/${id}/asset`;
  return {
    context,
    slideCopy,
    voiceover,
    music: { provider: "fallback", sourceFilename: "silent-professional-bed" },
    render: {
      template: "landing_page_slides_v1",
      fps: 30,
      durationSeconds: 24,
      variants: [
        { key: "landscape_16_9", width: 1920, height: 1080, videoUrl: `${base}/landscape.mp4`, thumbnailUrl: `${base}/landscape.jpg`, customThumbnailUrl: `${base}/landscape-custom.jpg` },
        { key: "vertical_9_16", width: 1080, height: 1920, videoUrl: `${base}/vertical.mp4`, thumbnailUrl: `${base}/vertical.jpg`, customThumbnailUrl: `${base}/vertical-custom.jpg` },
      ],
    },
  };
}

function clamp(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}

function isContext(value: unknown): value is LandingPageVideoContext {
  return typeof value === "object" && value !== null && "sourceId" in value && "pageUrl" in value && "cta" in value;
}
