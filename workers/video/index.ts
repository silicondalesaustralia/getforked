import { processVideo } from "@/workers/video/processor";

async function main() {
  try {
    const raw = process.env.VIDEO_JOB ?? "";
    if (!raw) {
      return;
    }

    const job = JSON.parse(raw) as {
      videoId?: string;
      key?: string;
      targetPlatforms?: string[];
    };

    const result = await processVideo({
      videoId: String(job.videoId ?? ""),
      key: String(job.key ?? ""),
      targetPlatforms: job.targetPlatforms ?? [],
    });

    if (!result.ok) {
      throw new Error(result.error);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Worker failed";
    console.error(message);
    process.exit(1);
  }
}

void main();
