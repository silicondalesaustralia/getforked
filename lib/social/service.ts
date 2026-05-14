import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { socialPosts, topicVideos } from "@/lib/db/schema";
import { publishToPlatform } from "@/lib/publish/adapters";
import type { PublishPlatform } from "@/lib/publish/types";
import type { SocialChannel, SocialCopy } from "@/lib/social/types";

const enabledChannels: SocialChannel[] = ["youtube", "facebook", "instagram", "tiktok", "x"];
const platformMap: Record<SocialChannel, PublishPlatform> = {
  youtube: "youtube",
  instagram: "instagram",
  tiktok: "tiktok",
  facebook: "facebook",
  x: "twitter",
  twitter: "twitter",
};

function buildDefaultCopy(sourceId: string, channel: SocialChannel, snapshot?: Record<string, unknown>): SocialCopy {
  const context = objectField(snapshot, "context");
  const slideCopy = objectField(snapshot, "slideCopy");
  const title = stringField(objectField(slideCopy, "s1"), "title") || `${sourceId} update`;
  const cta = objectField(context, "cta");
  const ctaUrl = stringField(cta, "url");
  return {
    title: channel === "youtube" ? title : clamp(title, 90),
    description: [stringField(objectField(slideCopy, "s2"), "body") || `Fresh ${channel} post for ${sourceId}.`, ctaUrl ? `Learn more: ${ctaUrl}` : ""].filter(Boolean).join("\n\n"),
    hashtags: ["#getforked", "#workflowautomation", "#saasreplacement"],
  };
}

export async function buildSocialDraft(topicVideoId: string, channel: SocialChannel) {
  const db = getDb();
  const videos = await db.select().from(topicVideos).where(eq(topicVideos.id, topicVideoId));
  const video = videos[0];
  if (!video) {
    return { ok: false as const, error: "Topic video not found." };
  }
  if (video.status !== "approved") {
    return { ok: false as const, error: "Video must be approved before social copy can be built." };
  }

  const variant = channel === "youtube" || channel === "facebook" ? "landscape_16_9" : "vertical_9_16";
  const copy = buildDefaultCopy(video.sourceId, channel, asRecord(video.renderConfigJson));

  const existing = await db
    .select({ id: socialPosts.id })
    .from(socialPosts)
    .where(
      and(
        eq(socialPosts.topicVideoId, topicVideoId),
        eq(socialPosts.channel, channel),
        eq(socialPosts.variant, variant),
      ),
    );

  if (existing.length > 0) {
    await db
      .update(socialPosts)
      .set({
        status: "draft",
        copyJson: copy,
        errorMessage: null,
        updatedAt: sql`now()`,
      })
      .where(eq(socialPosts.id, existing[0].id));
    return { ok: true as const, socialPostId: existing[0].id, status: "draft" as const };
  }

  const inserted = await db
    .insert(socialPosts)
    .values({
      topicVideoId,
      channel,
      variant,
      status: "draft",
      copyJson: copy,
    })
    .returning({ id: socialPosts.id });

  return { ok: true as const, socialPostId: inserted[0]?.id ?? null, status: "draft" as const };
}

export async function publishSocialPost(topicVideoId: string, channel: SocialChannel) {
  const db = getDb();
  const videos = await db.select().from(topicVideos).where(eq(topicVideos.id, topicVideoId));
  const video = videos[0];
  if (!video) {
    return { ok: false as const, error: "Topic video not found." };
  }
  if (video.status !== "approved") {
    return { ok: false as const, error: "Only approved videos can publish." };
  }

  const variant = channel === "youtube" || channel === "facebook" ? "landscape_16_9" : "vertical_9_16";
  const matches = await db
    .select()
    .from(socialPosts)
    .where(
      and(
        eq(socialPosts.topicVideoId, topicVideoId),
        eq(socialPosts.channel, channel),
        eq(socialPosts.variant, variant),
      ),
    );
  const post = matches[0];
  if (!post) {
    return { ok: false as const, error: "Social draft not found. Build copy first." };
  }
  if (post.status !== "draft" && post.status !== "publish_failed") {
    return { ok: false as const, error: "Post cannot be published from current state." };
  }

  await db
    .update(socialPosts)
    .set({
      status: "publishing",
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(socialPosts.id, post.id));

  const copy = post.copyJson as SocialCopy;
  const snapshot = asRecord(video.renderConfigJson);
  const publishResult = await publishToPlatform(platformMap[channel], {
    videoUrl: videoUrlForVariant(snapshot, variant) || video.primaryVideoUrl || "",
    title: copy.title,
    description: copy.description,
    thumbnailUrl: video.primaryThumbnailUrl,
    tags: copy.hashtags,
  });

  if (!publishResult.ok) {
    const errorMessage = publishResult.error ?? "Publish failed.";
    await db
      .update(socialPosts)
      .set({
        status: "publish_failed",
        errorMessage,
        updatedAt: sql`now()`,
      })
      .where(eq(socialPosts.id, post.id));
    return { ok: false as const, error: errorMessage };
  }

  const externalPostId = publishResult.platformPostId ?? "";
  const externalUrl = publishResult.externalUrl ?? (externalPostId ? `https://${channel}.com/${externalPostId}` : null);
  await db
    .update(socialPosts)
    .set({
      status: "published",
      externalPostId,
      externalUrl,
      publishedAt: sql`now()`,
      errorMessage: null,
      updatedAt: sql`now()`,
    })
    .where(eq(socialPosts.id, post.id));

  return { ok: true as const, socialPostId: post.id, externalPostId, externalUrl };
}

export async function buildAllSocialDrafts(topicVideoId: string) {
  const results = [];
  for (const channel of enabledChannels) {
    results.push({ channel, result: await buildSocialDraft(topicVideoId, channel) });
  }
  return { ok: true as const, results };
}

export async function publishAllSocialPosts(topicVideoId: string) {
  const results = [];
  for (const channel of enabledChannels) {
    const draft = await buildSocialDraft(topicVideoId, channel);
    if (!draft.ok) {
      results.push({ channel, ok: false, error: draft.error });
      continue;
    }
    const result = await publishSocialPost(topicVideoId, channel);
    results.push({ channel, ...result });
  }
  return { ok: results.some((item) => item.ok), results };
}

function videoUrlForVariant(snapshot: Record<string, unknown>, variant: string) {
  const render = objectField(snapshot, "render");
  const variants = Array.isArray(render.variants) ? render.variants.filter(isRecord) : [];
  const match = variants.find((item) => item.key === variant);
  return match ? stringField(match, "videoUrl") : undefined;
}

function objectField(value: unknown, key: string) {
  return isRecord(value) && isRecord(value[key]) ? value[key] : {};
}

function asRecord(value: unknown) {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(value: unknown, key: string) {
  return isRecord(value) && typeof value[key] === "string" ? value[key] : "";
}

function clamp(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}
