export const socialChannels = ["youtube", "instagram", "tiktok", "facebook", "x", "twitter"] as const;

export type SocialChannel = (typeof socialChannels)[number];

export const socialPostStates = ["draft", "publishing", "published", "publish_failed"] as const;

export type SocialPostState = (typeof socialPostStates)[number];

export type SocialCopy = {
  title: string;
  description: string;
  tags?: string[];
  hashtags?: string[];
};
