export const topicVideoStates = [
  "queued",
  "rendering",
  "render_failed",
  "ready_for_review",
  "approved",
  "rejected",
] as const;

export type TopicVideoState = (typeof topicVideoStates)[number];

export const topicVideoJobKinds = ["create", "regenerate", "regenerate_music", "regenerate_thumbnail"] as const;

export type TopicVideoJobKind = (typeof topicVideoJobKinds)[number];

export const topicVideoJobStates = ["queued", "rendering", "render_failed"] as const;

export type TopicVideoJobState = (typeof topicVideoJobStates)[number];

export type TopicVideoRecord = {
  id: string;
  sourceId: string;
  sourceType: string;
  status: TopicVideoState;
  topicContextJson: Record<string, unknown>;
  promptJson: Record<string, unknown> | null;
  renderConfigJson: Record<string, unknown> | null;
  primaryVideoUrl: string | null;
  primaryThumbnailUrl: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TopicVideoJobRecord = {
  id: string;
  topicVideoId: string;
  jobKind: TopicVideoJobKind;
  status: TopicVideoJobState;
  payload: Record<string, unknown>;
  workerId: string | null;
  startedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};
