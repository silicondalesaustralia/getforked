export type PublishPlatform = "tiktok" | "youtube" | "instagram" | "facebook" | "twitter";

export type PublishInput = {
  videoUrl: string;
  title: string;
  description: string;
};

export type PublishResult = {
  ok: boolean;
  platformPostId?: string;
  error?: string;
};
