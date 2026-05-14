import { writeFile } from "node:fs/promises";
import { glyphs } from "@/lib/video/preview-glyphs";

type SlideImage = {
  width: number;
  height: number;
  kind: "intro" | "middle" | "outro";
  title: string;
  body: string;
  footer: string;
};

export async function writeSlideImage(path: string, slide: SlideImage) {
  const pixels = Buffer.alloc(slide.width * slide.height * 3, 8);
  fill(pixels, slide.width, slide.height, [5, 7, 8]);
  if (slide.kind === "middle") {
    drawMiddleSlide(pixels, slide);
  } else {
    drawLogoSlide(pixels, slide);
  }
  await writeFile(path, Buffer.concat([Buffer.from(`P6\n${slide.width} ${slide.height}\n255\n`), pixels]));
}

function drawLogoSlide(pixels: Buffer, slide: SlideImage) {
  const scale = slide.width < slide.height ? 11 : 14;
  const message = slide.kind === "outro" ? "VISIT GETFORKED.DEV" : "OWN THE WORKFLOW";
  drawCentered(pixels, slide, message, Math.floor(slide.height * 0.62), Math.max(6, Math.floor(scale * 0.55)), [244, 247, 245]);
}

function drawMiddleSlide(pixels: Buffer, slide: SlideImage) {
  const margin = slide.width < slide.height ? 58 : 92;
  const screenshotHeight = Math.floor(slide.height * 0.62);
  const isVertical = slide.width < slide.height;
  const captionY = margin + screenshotHeight + (slide.width < slide.height ? 72 : 80);
  drawLines(pixels, slide, wrap(slide.body, isVertical ? 22 : 38), margin, captionY, isVertical ? 6 : 6, [244, 247, 245]);
  drawLines(pixels, slide, [slide.footer.toUpperCase()], margin, slide.height - margin - 54, 5, [24, 227, 138]);
}

function drawLines(pixels: Buffer, slide: SlideImage, lines: string[], x: number, y: number, scale: number, color: number[]) {
  lines.slice(0, 8).forEach((line, index) => {
    drawText(pixels, slide.width, slide.height, line.toUpperCase(), x, y + index * scale * 10, scale, color);
  });
}

function drawText(pixels: Buffer, width: number, height: number, text: string, x: number, y: number, scale: number, color: number[]) {
  let cursor = x;
  for (const char of text) {
    const glyph = glyphs[char] ?? glyphs[char === " " ? " " : "-"];
    if (!glyph) {
      cursor += scale * 4;
      continue;
    }
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((cell, colIndex) => {
        if (cell === "1") rect(pixels, width, height, cursor + colIndex * scale, y + rowIndex * scale, scale, scale, color);
      });
    });
    cursor += scale * 7;
  }
}

function drawCentered(pixels: Buffer, slide: SlideImage, text: string, y: number, scale: number, color: number[]) {
  const x = Math.floor((slide.width - text.length * scale * 7) / 2);
  drawText(pixels, slide.width, slide.height, text, x, y, scale, color);
}

function wrap(text: string, limit: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > limit) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  return [...lines, current].filter(Boolean);
}

function fill(pixels: Buffer, width: number, height: number, color: number[]) {
  rect(pixels, width, height, 0, 0, width, height, color);
}

function rect(pixels: Buffer, width: number, height: number, x: number, y: number, rectWidth: number, rectHeight: number, color: number[]) {
  for (let row = Math.max(0, y); row < Math.min(height, y + rectHeight); row += 1) {
    for (let col = Math.max(0, x); col < Math.min(width, x + rectWidth); col += 1) {
      const offset = (row * width + col) * 3;
      pixels[offset] = color[0] ?? 0;
      pixels[offset + 1] = color[1] ?? 0;
      pixels[offset + 2] = color[2] ?? 0;
    }
  }
}
