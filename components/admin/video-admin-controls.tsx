export { ScriptEditor } from "@/components/admin/script-editor";

export function ActionForm({ action, label }: { action: string; label: string }) {
  return (
    <form action={action} method="post">
      <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500">{label}</button>
    </form>
  );
}

export function DeleteVideosForm({ group, label }: { group: "pending" | "approved"; label: string }) {
  return (
    <form action="/api/admin/topic-videos/delete-batch" method="post">
      <input type="hidden" name="group" value={group} />
      <button className="rounded-lg border border-red-900/70 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-700">
        {label}
      </button>
    </form>
  );
}

export function PreviewLinks({ topicVideoId }: { topicVideoId: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-sm">
      <a className="text-accent hover:underline" href={`/api/admin/topic-videos/${topicVideoId}/asset/landscape.mp4`} target="_blank">
        View landscape
      </a>
      <a className="text-accent hover:underline" href={`/api/admin/topic-videos/${topicVideoId}/asset/vertical.mp4`} target="_blank">
        View vertical
      </a>
    </div>
  );
}
