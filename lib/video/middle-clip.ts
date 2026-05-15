import { spawn } from "node:child_process";

type Orientation = "landscape" | "vertical";

type MiddleClipInput = {
  screenshotPath: string | null;
  fallbackImagePath: string;
  outputPath: string;
  width: number;
  height: number;
  orientation: Orientation;
  durationSeconds: number;
};

export async function buildMiddleClip(input: MiddleClipInput) {
  const source = input.screenshotPath || input.fallbackImagePath;
  const filter = input.orientation === "vertical"
    ? verticalRotateFilter(input)
    : landscapeZoomFilter(input);
  await runProcess(ffmpegPath(), [
    "-y",
    "-loop",
    "1",
    "-i",
    source,
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    "-t",
    String(input.durationSeconds),
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    input.outputPath,
  ]);
  return input.outputPath;
}

function verticalRotateFilter(input: MiddleClipInput) {
  const padding = 1.35;
  const stageW = Math.round(input.width * padding);
  const stageH = Math.round(input.height * padding);
  const settle = 0.6;
  const startAngle = "PI/10";
  const angleExpr = `if(lt(t\\,${settle})\\,(${settle}-t)/${settle}*${startAngle}\\,0)`;
  const sourceCropOffset = Math.round(input.height * 0.22);
  return [
    `[0:v]scale=${input.width}:-1:flags=lanczos`,
    `crop=${input.width}:${input.height}:0:${sourceCropOffset}`,
    `pad=${stageW}:${stageH}:(ow-iw)/2:(oh-ih)/2:color=0x050708`,
    `rotate=angle='${angleExpr}':c=0x050708:ow=${stageW}:oh=${stageH}:fillcolor=0x050708`,
    `crop=${input.width}:${input.height}:(in_w-${input.width})/2:(in_h-${input.height})/2`,
    "format=yuv420p[v]",
  ].join(",");
}

function landscapeZoomFilter(input: MiddleClipInput) {
  const frames = Math.max(1, Math.round(input.durationSeconds * 30));
  const zoomStep = 0.55 / frames;
  const zoom = `max(1.0,1.55-on*${zoomStep.toFixed(6)})`;
  const x = "(iw-iw/zoom)*0.05";
  const y = "(ih-ih/zoom)*0.0";
  return [
    "[0:v]scale=4200:-1:flags=lanczos",
    `zoompan=z='${zoom}':x='${x}':y='${y}':d=${frames}:s=${input.width}x${input.height}:fps=30`,
    "format=yuv420p[v]",
  ].join(",");
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
