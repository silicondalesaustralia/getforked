export type VideoCaptionSegment = {
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export type VideoCaptions = {
  format: "burned_in" | "srt" | "vtt";
  style: {
    position: "bottom" | "middle";
    maxCharsPerLine: number;
    fontSize: number;
    background: "none" | "pill" | "box";
  };
  segments: VideoCaptionSegment[];
};

export function buildCaptionsFromScript(script: string, durationSeconds: number): VideoCaptions {
  const chunks = chunkScript(script);
  const totalWords = chunks.reduce((total, chunk) => total + wordCount(chunk), 0) || 1;
  let cursor = 0;
  const segments = chunks.map((chunk, index) => {
    const share = wordCount(chunk) / totalWords;
    const segmentDuration = Math.max(1.4, durationSeconds * share);
    const startSeconds = cursor;
    const endSeconds = index === chunks.length - 1 ? durationSeconds : Math.min(durationSeconds, cursor + segmentDuration);
    cursor = endSeconds;
    return { startSeconds: round(startSeconds), endSeconds: round(endSeconds), text: chunk };
  });

  return {
    format: "burned_in",
    style: {
      position: "bottom",
      maxCharsPerLine: 42,
      fontSize: 54,
      background: "pill",
    },
    segments,
  };
}

function chunkScript(script: string) {
  const sentences = script
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > 84 && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [script.trim()].filter(Boolean);
}

function wordCount(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
