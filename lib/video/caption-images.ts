import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { CaptionFrame } from "@/lib/video/caption-timeline";

export type CaptionOverlay = {
  pngPath: string;
  startSeconds: number;
  endSeconds: number;
};

export async function renderCaptionImages(input: { frames: CaptionFrame[]; dir: string; width: number; height: number }) {
  const captionDir = path.join(input.dir, "captions");
  await mkdir(captionDir, { recursive: true });
  const overlays: CaptionOverlay[] = [];
  const height = bandHeight(input.height);
  for (let index = 0; index < input.frames.length; index += 1) {
    const frame = input.frames[index];
    if (!frame) continue;
    const svgPath = path.join(captionDir, `caption-${index}.svg`);
    const pngPath = path.join(captionDir, `caption-${index}.png`);
    const svg = captionSvg(frame, input.width, height);
    await writeFile(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg), { density: 144 })
      .resize(input.width, height, { fit: "fill" })
      .png()
      .toFile(pngPath);
    overlays.push({ pngPath, startSeconds: frame.startSeconds, endSeconds: frame.endSeconds });
  }
  return { overlays, height };
}

function captionSvg(frame: CaptionFrame, width: number, height: number) {
  const fontSize = Math.round(width < 1200 ? 56 : 64);
  const separator = `<tspan fill="#F4F7F5">\u00a0</tspan>`;
  const words = frame.words.map((word, index) => {
    const fill = index === frame.activeIndex ? "#18E38A" : "#F4F7F5";
    return `<tspan fill="${fill}">${escapeXml(word)}</tspan>`;
  }).join(separator);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="#050708"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="800" xml:space="preserve">${words}</text>
</svg>`;
}

function bandHeight(videoHeight: number) {
  return Math.round(videoHeight * 0.14);
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
