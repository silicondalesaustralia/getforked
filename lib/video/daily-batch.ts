import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";
import { buildLandingPageVideoContext, listLandingPageVideoCandidates } from "@/lib/video/landing-page-context";
import { createTopicVideo, queueTopicVideoJob } from "@/lib/video/service";

const batchSize = 5;
const reviewableStates = ["queued", "rendering", "ready_for_review", "approved"] as const;

export async function createDailyVideoBatch() {
  const db = getDb();
  const dayStart = acstDayStartUtc();
  const existing = await db
    .select()
    .from(topicVideos)
    .where(and(gte(topicVideos.createdAt, dayStart), inArray(topicVideos.status, reviewableStates)));

  if (existing.length >= batchSize) {
    await refreshLegacyVideos(existing.slice(0, batchSize));
    return { ok: true as const, created: 0, items: existing.slice(0, batchSize), reused: true };
  }

  const existingKeys = new Set(existing.map((item) => `${item.sourceType}:${item.sourceId}`));
  const created = [];
  const candidates = listLandingPageVideoCandidates()
    .filter((candidate) => !existingKeys.has(`${candidate.sourceType}:${candidate.sourceId}`))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  for (const candidate of candidates) {
    if (existing.length + created.length >= batchSize) break;
    const duplicates = await db
      .select({ id: topicVideos.id })
      .from(topicVideos)
      .where(
        and(
          eq(topicVideos.sourceType, candidate.sourceType),
          eq(topicVideos.sourceId, candidate.sourceId),
          gte(topicVideos.createdAt, dayStart),
        ),
      );
    if (duplicates.length > 0) continue;

    const context = buildLandingPageVideoContext(candidate.sourceType, candidate.sourceId);
    const video = await createTopicVideo({
      sourceId: candidate.sourceId,
      sourceType: candidate.sourceType,
      topicContextJson: context,
    });
    await queueTopicVideoJob({ topicVideoId: video.id, jobKind: "create" });
    created.push(video);
  }

  const items = [...existing, ...created];
  await refreshLegacyVideos(existing);
  return { ok: true as const, created: created.length, items, reused: existing.length > 0 };
}

export async function getTodaysVideoBatch() {
  return getDb()
    .select()
    .from(topicVideos)
    .where(gte(topicVideos.createdAt, acstDayStartUtc()))
    .orderBy(sql`${topicVideos.createdAt} ASC`);
}

function acstDayStartUtc() {
  const now = new Date();
  const acstOffsetMs = 9.5 * 60 * 60 * 1000;
  const acst = new Date(now.getTime() + acstOffsetMs);
  const startAcst = new Date(Date.UTC(acst.getUTCFullYear(), acst.getUTCMonth(), acst.getUTCDate()));
  return new Date(startAcst.getTime() - acstOffsetMs);
}

async function refreshLegacyVideos(videos: Array<typeof topicVideos.$inferSelect>) {
  const legacy = videos.filter((video) => promptDuration(video.promptJson) !== 15);
  for (const video of legacy) {
    await queueTopicVideoJob({ topicVideoId: video.id, jobKind: "regenerate" });
  }
}

function promptDuration(value: unknown) {
  if (typeof value !== "object" || value === null || !("voiceover" in value)) return null;
  const voiceover = value.voiceover;
  if (typeof voiceover !== "object" || voiceover === null || !("durationSeconds" in voiceover)) return null;
  return typeof voiceover.durationSeconds === "number" ? voiceover.durationSeconds : null;
}
