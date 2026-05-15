import { listMusicTracks, type MusicTrack } from "@/lib/video/music-tracks";
import { getElevenLabsVoiceOptions } from "@/lib/video/voices";

type Props = {
  topicVideoId: string;
  value: unknown;
};

export function ScriptEditor({ topicVideoId, value }: Props) {
  const voices = getElevenLabsVoiceOptions();
  const savedVoiceId = readSelectedVoiceId(value);
  const selectedVoiceId = voices.some((voice) => voice.id === savedVoiceId) ? savedVoiceId ?? "" : voices[0]?.id ?? "";

  const musicTracks = listMusicTracks();
  const savedMusicId = readSelectedMusicId(value);
  const selectedMusicId = musicTracks.some((track) => track.id === savedMusicId) ? savedMusicId ?? "" : "";

  return (
    <form action={`/api/admin/topic-videos/${topicVideoId}/script`} method="post" className="rounded-lg border border-zinc-800 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-200">Slide and voiceover JSON</p>
        <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500">Save script</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-zinc-400">Voice</label>
        <select name="voiceId" defaultValue={selectedVoiceId} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>{voice.label}</option>
          ))}
        </select>
        <label className="ml-3 text-xs text-zinc-400">Music</label>
        <select name="musicTrackId" defaultValue={selectedMusicId} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
          <option value="">No music</option>
          {musicTracks.map((track) => (
            <option key={track.id} value={track.id}>{track.label}</option>
          ))}
        </select>
      </div>
      <VoicePreviewList topicVideoId={topicVideoId} voices={voices} />
      <MusicPreviewList tracks={musicTracks} />
      <textarea
        name="promptJson"
        className="mt-2 min-h-64 w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 outline-none focus:border-accent"
        defaultValue={JSON.stringify(value ?? {}, null, 2)}
      />
      <p className="mt-2 text-xs text-zinc-500">Save before opening a preview. Voice preview uses the saved script.</p>
    </form>
  );
}

function VoicePreviewList({ topicVideoId, voices }: { topicVideoId: string; voices: { id: string; label: string }[] }) {
  return (
    <div className="mt-3 grid gap-2 text-xs">
      {voices.map((voice) => (
        <div key={voice.id} className="grid gap-2 rounded border border-zinc-800 p-2 text-zinc-300 sm:grid-cols-[110px_1fr] sm:items-center">
          <span>{voice.label}</span>
          <audio controls preload="none" className="h-8 w-full">
            <source src={`/api/admin/topic-videos/${topicVideoId}/voice-preview?voiceId=${voice.id}`} type="audio/mpeg" />
          </audio>
        </div>
      ))}
    </div>
  );
}

function MusicPreviewList({ tracks }: { tracks: MusicTrack[] }) {
  if (tracks.length === 0) {
    return (
      <p className="mt-3 text-xs text-zinc-500">
        No music tracks found. Drop audio files into the directory set by VIDEO_MUSIC_DIR (default: assets/music).
      </p>
    );
  }
  return (
    <div className="mt-3 grid gap-2 text-xs">
      {tracks.map((track) => (
        <div key={track.id} className="grid gap-2 rounded border border-zinc-800 p-2 text-zinc-300 sm:grid-cols-[110px_1fr] sm:items-center">
          <span>{track.label}</span>
          <audio controls preload="none" className="h-8 w-full">
            <source src={`/api/admin/music-preview/${track.id}`} />
          </audio>
        </div>
      ))}
    </div>
  );
}

function readSelectedVoiceId(value: unknown) {
  if (typeof value !== "object" || value === null || !("voiceover" in value)) return null;
  const voiceover = value.voiceover;
  if (typeof voiceover !== "object" || voiceover === null || !("voiceId" in voiceover)) return null;
  return typeof voiceover.voiceId === "string" ? voiceover.voiceId : null;
}

function readSelectedMusicId(value: unknown) {
  if (typeof value !== "object" || value === null || !("music" in value)) return null;
  const music = (value as { music?: unknown }).music;
  if (typeof music !== "object" || music === null || !("trackId" in music)) return null;
  const trackId = (music as { trackId?: unknown }).trackId;
  return typeof trackId === "string" ? trackId : null;
}
