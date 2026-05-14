import { getElevenLabsVoiceOptions } from "@/lib/video/voices";

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

export function ScriptEditor({ topicVideoId, value }: { topicVideoId: string; value: unknown }) {
  const voices = getElevenLabsVoiceOptions();
  const savedVoiceId = readSelectedVoiceId(value);
  const selectedVoiceId = voices.some((voice) => voice.id === savedVoiceId) ? savedVoiceId ?? "" : voices[0]?.id ?? "";

  return (
    <form action={`/api/admin/topic-videos/${topicVideoId}/script`} method="post" className="rounded-lg border border-zinc-800 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-200">Slide and voiceover JSON</p>
        <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500">Save script</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select name="voiceId" defaultValue={selectedVoiceId} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>{voice.label}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 grid gap-2 text-xs">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className="grid gap-2 rounded border border-zinc-800 p-2 text-zinc-300 sm:grid-cols-[110px_1fr] sm:items-center"
          >
            <span>{voice.label}</span>
            <audio controls preload="none" className="h-8 w-full">
              <source src={`/api/admin/topic-videos/${topicVideoId}/voice-preview?voiceId=${voice.id}`} type="audio/mpeg" />
            </audio>
          </div>
        ))}
      </div>
      <textarea
        name="promptJson"
        className="mt-2 min-h-64 w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 outline-none focus:border-accent"
        defaultValue={JSON.stringify(value ?? {}, null, 2)}
      />
      <p className="mt-2 text-xs text-zinc-500">Save before opening a preview. Voice preview uses the saved script.</p>
    </form>
  );
}

function readSelectedVoiceId(value: unknown) {
  if (typeof value !== "object" || value === null || !("voiceover" in value)) return null;
  const voiceover = value.voiceover;
  if (typeof voiceover !== "object" || voiceover === null || !("voiceId" in voiceover)) return null;
  return typeof voiceover.voiceId === "string" ? voiceover.voiceId : null;
}
