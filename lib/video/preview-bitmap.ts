import { writeFile } from "node:fs/promises";

type SlideImage = {
  width: number;
  height: number;
  kind: "intro" | "middle" | "outro";
};

export async function writeSlideImage(path: string, slide: SlideImage) {
  const pixels = Buffer.alloc(slide.width * slide.height * 3, 8);
  fill(pixels, slide.width, slide.height, [5, 7, 8]);
  await writeFile(path, Buffer.concat([Buffer.from(`P6\n${slide.width} ${slide.height}\n255\n`), pixels]));
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
