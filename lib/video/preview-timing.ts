export function syncedDuration(audioDuration: number | null | undefined) {
  if (!audioDuration) return 15;
  return Math.min(18, Math.max(12, Math.ceil(audioDuration + 0.5)));
}

export function slideDurations(total: number) {
  const intro = 2.5;
  const outro = 2.5;
  return [intro, Math.max(7, total - intro - outro), outro];
}
