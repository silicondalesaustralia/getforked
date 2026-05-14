import { spawn } from "node:child_process";

export async function capturePageScreenshot(input: { pageUrl: string; outputPath: string }) {
  const chrome = chromePath();
  if (!chrome) return null;

  const url = localPreviewUrl(input.pageUrl);
  await runProcess(chrome, [
    "--headless=new",
    "--hide-scrollbars",
    "--disable-gpu",
    "--no-sandbox",
    "--window-size=1600,900",
    `--screenshot=${input.outputPath}`,
    url,
  ]);
  return input.outputPath;
}

function localPreviewUrl(pageUrl: string) {
  const localBase = process.env.NEXTAUTH_URL || "http://localhost:3000";
  try {
    const url = new URL(pageUrl);
    if (url.hostname === "getforked.dev") {
      return `${localBase}${url.pathname}${url.search}`;
    }
  } catch {
    return pageUrl;
  }
  return pageUrl;
}

function chromePath() {
  return process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
