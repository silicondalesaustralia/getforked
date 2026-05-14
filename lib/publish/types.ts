export type PublishPlatform = "tiktok" | "youtube" | "instagram" | "facebook" | "twitter";

export type PublishInput = {
  videoUrl: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  tags?: string[];
};

export type PublishResult = {
  ok: boolean;
  platformPostId?: string;
  externalUrl?: string;
  error?: string;
};
