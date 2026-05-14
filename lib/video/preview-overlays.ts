import { spawn } from "node:child_process";
import path from "node:path";

type OverlayInput = {
  basePath: string;
  outputPath: string;
  kind: "intro" | "middle" | "outro";
  width: number;
  height: number;
  cacheDir: string;
  middleImagePath?: string | null;
};

export async function applySlideOverlay(input: OverlayInput) {
  if (input.kind === "middle") {
    return overlayMiddleScreenshot(input);
  }
  return overlayLogo(input);
}

async function overlayLogo(input: OverlayInput) {
  const logoSvg = process.env.VIDEO_LOGO_SVG_PATH;
  if (!logoSvg) return input.basePath;

  const logoPng = path.join(input.cacheDir, "logo.png");
  await runProcess("sips", ["-s", "format", "png", logoSvg, "--out", logoPng]);
  const logoWidth = Math.floor(input.width * (input.width < input.height ? 0.66 : 0.34));
  await runProcess(ffmpegPath(), [
    "-y",
    "-i",
    input.basePath,
    "-i",
    logoPng,
    "-filter_complex",
    `[1:v]scale=${logoWidth}:-1[logo];[0:v][logo]overlay=(W-w)/2:H*0.38-h/2`,
    "-frames:v",
    "1",
    input.outputPath,
  ]);
  return input.outputPath;
}

async function overlayMiddleScreenshot(input: OverlayInput) {
  const screenshot = input.middleImagePath || process.env.VIDEO_MID_SLIDE_IMAGE_PATH;
  if (!screenshot) return input.basePath;

  const margin = input.width < input.height ? 58 : 92;
  const targetWidth = input.width - margin * 2;
  const targetHeight = Math.floor(input.height * 0.62);
  await runProcess(ffmpegPath(), [
    "-y",
    "-i",
    input.basePath,
    "-i",
    screenshot,
    "-filter_complex",
    `[1:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:color=0x050708[shot];[0:v][shot]overlay=${margin}:${margin}`,
    "-frames:v",
    "1",
    input.outputPath,
  ]);
  return input.outputPath;
}

function ffmpegPath() {
  return process.env.FFMPEG_PATH || "ffmpeg";
}

function runProcess(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      code === 0 ? resolve() : reject(new Error(`${command} failed with code ${code}: ${stderr}`));
    });
  });
}
