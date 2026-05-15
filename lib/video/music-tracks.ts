import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export type MusicTrack = {
  id: string;
  label: string;
  filePath: string;
};

const SUPPORTED_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".ogg", ".aac"]);

export function getMusicDirectory() {
  const configured = process.env.VIDEO_MUSIC_DIR;
  if (configured && configured.trim().length > 0) {
    return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "assets", "music");
}

export function listMusicTracks(): MusicTrack[] {
  const dir = getMusicDirectory();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => SUPPORTED_EXTENSIONS.has(path.extname(entry).toLowerCase()))
    .filter((entry) => statSync(path.join(dir, entry)).isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => ({
      id: trackIdFromFilename(entry),
      label: trackLabelFromFilename(entry),
      filePath: path.join(dir, entry),
    }));
}

export function getMusicTrackById(trackId: string): MusicTrack | null {
  if (!trackId) return null;
  const safeId = trackId.replace(/[^a-z0-9_-]/gi, "");
  if (safeId !== trackId) return null;
  return listMusicTracks().find((track) => track.id === trackId) ?? null;
}

function trackIdFromFilename(filename: string) {
  const base = filename.replace(path.extname(filename), "");
  return base.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function trackLabelFromFilename(filename: string) {
  return filename
    .replace(path.extname(filename), "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
