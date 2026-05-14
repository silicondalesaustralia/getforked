import { desc, inArray } from "drizzle-orm";
import { ActionForm, DeleteVideosForm, PreviewLinks, ScriptEditor } from "@/components/admin/video-admin-controls";
import { getDb } from "@/lib/db/client";
import { socialPosts, topicVideos } from "@/lib/db/schema";
import { getTodaysVideoBatch } from "@/lib/video/daily-batch";

const channels = ["youtube", "facebook", "instagram", "tiktok", "x"] as const;

export default async function AdminVideosPage() {
  const [today, recent] = await Promise.all([
    getTodaysVideoBatch(),
    getDb().select().from(topicVideos).orderBy(desc(topicVideos.updatedAt)).limit(25),
  ]);
  const ids = recent.map((item) => item.id);
  const posts = ids.length > 0 ? await getDb().select().from(socialPosts).where(inArray(socialPosts.topicVideoId, ids)) : [];

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Daily Landing Page Videos</h2>
          <p className="text-zinc-300">Create five videos each morning ACST, review, approve, then publish to every channel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/api/admin/topic-videos/daily-batch" method="post">
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-zinc-950">Create today's 5 videos</button>
          </form>
          <DeleteVideosForm group="pending" label="Delete unapproved videos" />
          <DeleteVideosForm group="approved" label="Delete approved videos" />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 p-4">
        <h3 className="font-semibold">Today's batch ({today.length}/5)</h3>
        <div className="mt-4 grid gap-4">
          {recent.map((item) => (
            <article key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-100">{item.sourceId}</p>
                  <p className="text-sm text-zinc-400">{item.sourceType} · {item.status} · {item.updatedAt.toISOString()}</p>
                  {item.primaryVideoUrl ? <PreviewLinks topicVideoId={item.id} /> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionForm action={`/api/admin/topic-videos/${item.id}/approve`} label="Approve" />
                  <ActionForm action={`/api/admin/topic-videos/${item.id}/regenerate`} label="Regenerate" />
                  <ActionForm action={`/api/admin/topic-videos/${item.id}/regenerate-music`} label="Music" />
                  <ActionForm action={`/api/admin/topic-videos/${item.id}/regenerate-thumbnail`} label="Thumbnail" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <ScriptEditor topicVideoId={item.id} value={item.promptJson} />
                <div className="rounded-lg border border-zinc-800 p-3">
                  <p className="text-sm font-semibold text-zinc-200">Social publishing</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionForm action={`/api/admin/topic-videos/${item.id}/social/build-all`} label="Build all drafts" />
                    <ActionForm action={`/api/admin/topic-videos/${item.id}/social/publish-all`} label="Publish all" />
                  </div>
                  <div className="mt-3 grid gap-2">
                    {channels.map((channel) => (
                      <div key={channel} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-900/70 p-2">
                        <span className="text-sm text-zinc-300">{channelStatus(posts, item.id, channel)}</span>
                        <div className="flex gap-2">
                          <ActionForm action={`/api/admin/topic-videos/${item.id}/social/${channel}/build`} label="Draft" />
                          <ActionForm action={`/api/admin/topic-videos/${item.id}/social/${channel}/publish`} label="Publish" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function channelStatus(posts: Array<typeof socialPosts.$inferSelect>, topicVideoId: string, channel: string) {
  const post = posts.find((item) => item.topicVideoId === topicVideoId && item.channel === channel);
  return `${channel}: ${post?.status ?? "not drafted"}`;
}
