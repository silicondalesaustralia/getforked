import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { topicVideos } from "@/lib/db/schema";

export default async function AdminVideosPage() {
  const items = await getDb().select().from(topicVideos).orderBy(desc(topicVideos.updatedAt)).limit(25);

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Topic Videos</h2>
      <p className="text-zinc-300">
        Lifecycle foundation is active: create, queue, review status, approve, and reject are now wired.
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/40">
            <tr>
              <th className="px-3 py-2 font-medium text-zinc-300">Source</th>
              <th className="px-3 py-2 font-medium text-zinc-300">Type</th>
              <th className="px-3 py-2 font-medium text-zinc-300">Status</th>
              <th className="px-3 py-2 font-medium text-zinc-300">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={4}>
                  No topic videos yet. Create one with `POST /api/admin/topic-videos`.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-900">
                  <td className="px-3 py-2 text-zinc-200">{item.sourceId}</td>
                  <td className="px-3 py-2 text-zinc-400">{item.sourceType}</td>
                  <td className="px-3 py-2 text-zinc-200">{item.status}</td>
                  <td className="px-3 py-2 text-zinc-400">{item.updatedAt.toISOString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
