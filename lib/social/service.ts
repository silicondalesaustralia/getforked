import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { socialPosts, topicVideos } from "@/lib/db/schema";
import { publishToPlatform } from "@/lib/publish/adapters";
import type { PublishPlatform } from "@/lib/publish/types";
import type { SocialChannel, SocialCopy } from "@/lib/social/types";

const platformMap: Record<SocialChannel, PublishPlatform> = {
  youtube: "youtube",
  instagram: "instagram",
  tiktok: "tiktok",
  facebook: "facebook",
  x: "twitter",
  twitter: "twitter",
};

function buildDefaultCopy(sourceId: string, channel: SocialChannel): SocialCopy {
  return {
    title: `${sourceId} update`,
    description: `Fresh ${channel} post for ${sourceId}.`,
    hashtags: ["#getforked"],
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

  const variant = channel === "youtube" ? "landscape_16_9" : "vertical_9_16";
  const copy = buildDefaultCopy(video.sourceId, channel);

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

  const variant = channel === "youtube" ? "landscape_16_9" : "vertical_9_16";
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
  const publishResult = await publishToPlatform(platformMap[channel], {
    videoUrl: video.primaryVideoUrl ?? "",
    title: copy.title,
    description: copy.description,
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
  const externalUrl = externalPostId ? `https://${channel}.com/${externalPostId}` : null;
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
