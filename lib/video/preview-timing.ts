const INTRO_SECONDS = 2;
const OUTRO_SECONDS = 2.5;
const TAIL_BUFFER = 0.6;
const MIN_TOTAL = 10;

export function syncedDuration(audioDuration: number | null | undefined) {
  if (!audioDuration || audioDuration <= 0) return 15;
  const total = audioDuration + INTRO_SECONDS + TAIL_BUFFER;
  return Math.max(MIN_TOTAL, round(total));
}

export function slideDurations(total: number) {
  const middle = Math.max(4, total - INTRO_SECONDS - OUTRO_SECONDS);
  return [INTRO_SECONDS, middle, OUTRO_SECONDS];
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
