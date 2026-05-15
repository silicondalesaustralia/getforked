import type { ElevenLabsAlignment } from "@/lib/video/elevenlabs-audio";

export type CaptionFrame = {
  words: string[];
  activeIndex: number;
  startSeconds: number;
  endSeconds: number;
};

type TimedWord = {
  text: string;
  startSeconds: number;
  endSeconds: number;
};

const MAX_PHRASE_WORDS = 5;
const SENTENCE_BREAK = /[.!?]$/;
const CLAUSE_BREAK = /[,;:]$/;

export function buildCaptionFrames(input: { script: string; alignment: ElevenLabsAlignment | null; durationSeconds: number }) {
  const words = timedWords(input.script, input.alignment, input.durationSeconds);
  const phrases = groupByPunctuation(words);
  const frames: CaptionFrame[] = [];
  for (const phrase of phrases) {
    const display = phrase.map((word) => cleanWord(word.text)).filter((value) => value.length > 0);
    if (display.length === 0) continue;
    phrase.forEach((word, activeIndex) => {
      frames.push({
        words: display,
        activeIndex,
        startSeconds: word.startSeconds,
        endSeconds: Math.max(word.endSeconds, word.startSeconds + 0.12),
      });
    });
  }
  return frames;
}

function groupByPunctuation(words: TimedWord[]) {
  const phrases: TimedWord[][] = [];
  let current: TimedWord[] = [];
  for (const word of words) {
    current.push(word);
    const sentence = SENTENCE_BREAK.test(word.text);
    const clause = CLAUSE_BREAK.test(word.text);
    const full = current.length >= MAX_PHRASE_WORDS;
    if (sentence || (clause && current.length >= 3) || full) {
      phrases.push(current);
      current = [];
    }
  }
  if (current.length > 0) phrases.push(current);
  return phrases;
}

function timedWords(script: string, alignment: ElevenLabsAlignment | null, durationSeconds: number) {
  const tokens = [...script.matchAll(/\S+/g)].map((match) => ({
    text: match[0],
    startIndex: match.index ?? 0,
    endIndex: (match.index ?? 0) + match[0].length - 1,
  }));
  if (!alignment || alignment.character_start_times_seconds.length === 0) {
    return distributeWords(tokens.map((token) => token.text), durationSeconds);
  }

  const last = alignment.character_start_times_seconds.length - 1;
  return tokens.map((token, index) => {
    const startIndex = Math.min(token.startIndex, last);
    const endIndex = Math.min(token.endIndex, last);
    const fallbackStart = (durationSeconds / Math.max(tokens.length, 1)) * index;
    const fallbackEnd = (durationSeconds / Math.max(tokens.length, 1)) * (index + 1);
    return {
      text: token.text,
      startSeconds: round(alignment.character_start_times_seconds[startIndex] ?? fallbackStart),
      endSeconds: round(alignment.character_end_times_seconds[endIndex] ?? fallbackEnd),
    };
  });
}

function distributeWords(words: string[], durationSeconds: number): TimedWord[] {
  const step = durationSeconds / Math.max(words.length, 1);
  return words.map((word, index) => ({
    text: word,
    startSeconds: round(index * step),
    endSeconds: round((index + 1) * step),
  }));
}

function cleanWord(value: string) {
  return value.replace(/[^\w'.-]/g, "");
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
