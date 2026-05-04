type VideoJob = {
  videoId: string;
  key: string;
  targetPlatforms: string[];
};

export async function processVideo(job: VideoJob) {
  try {
    if (!job.videoId || !job.key) {
      throw new Error("Missing video job identifiers.");
    }

    return {
      ok: true,
      videoId: job.videoId,
      previewUrl: `s3://processed/${job.key}.thumb.jpg`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Video processing failed.",
    };
  }
}
