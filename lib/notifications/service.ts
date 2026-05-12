type NotificationEvent = {
  type: "brief_submitted" | "builder_applied" | "contact_submitted" | "support_submitted";
  recipient: "admin" | "buyer" | "builder";
  subject: string;
  metadata?: Record<string, string>;
};

export async function sendNotification(event: NotificationEvent) {
  try {
    console.info("notification", event);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification failed.";
    throw new Error(message);
  }
}
