import { claimNextJob, processClaimedJob } from "@/workers/video/processor";

const pollIntervalMs = Number(process.env.VIDEO_WORKER_POLL_MS ?? 2500);

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const workerId = process.env.VIDEO_WORKER_ID ?? `worker-${process.pid}`;

  while (true) {
    try {
      const claimed = await claimNextJob(workerId);
      if (!claimed) {
        await sleep(pollIntervalMs);
        continue;
      }

      const result = await processClaimedJob(claimed);
      if (!result.ok) {
        console.error(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Worker failed";
      console.error(message);
      await sleep(pollIntervalMs);
    }
  }
}

void main();
