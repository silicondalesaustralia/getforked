type NotificationEvent = {
  type: "brief_submitted" | "builder_applied" | "contact_submitted" | "support_submitted";
  recipient: "admin" | "buyer" | "builder";
  subject: string;
  metadata?: Record<string, string>;
};

function resolveAdminRecipient() {
  const explicitRecipient = process.env.RESEND_TO_EMAIL?.trim();
  if (explicitRecipient) {
    return explicitRecipient;
  }
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()).filter(Boolean);
  return adminEmails?.[0] ?? "";
}

function formatNotificationBody(event: NotificationEvent) {
  const metadata = Object.entries(event.metadata ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return metadata ? `${event.type}\n\n${metadata}` : event.type;
}

const fallbackFromEmail = "GetForked <onboarding@resend.dev>";

async function sendResendRequest(input: {
  apiKey: string;
  from: string;
  to: string;
  event: NotificationEvent;
}) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.event.subject,
      text: formatNotificationBody(input.event),
    }),
  });
}

async function sendViaResend(event: NotificationEvent) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || event.recipient !== "admin") {
    return;
  }
  const to = resolveAdminRecipient();
  if (!to) {
    throw new Error("Missing RESEND_TO_EMAIL or ADMIN_EMAILS for admin notifications.");
  }
  const from = process.env.RESEND_FROM_EMAIL?.trim() || fallbackFromEmail;
  let response = await sendResendRequest({ apiKey, from, to, event });
  if (!response.ok) {
    const errorBody = await response.text();
    const domainNotVerified = response.status === 403 && errorBody.includes("domain is not verified");
    if (domainNotVerified && from !== fallbackFromEmail) {
      response = await sendResendRequest({ apiKey, from: fallbackFromEmail, to, event });
      if (response.ok) {
        console.warn("notification_warning", "Primary RESEND_FROM_EMAIL domain is not verified. Used onboarding fallback sender.");
        return;
      }
      const fallbackErrorBody = await response.text();
      throw new Error(`Resend notification failed: ${response.status} ${fallbackErrorBody}`);
    }
    throw new Error(`Resend notification failed: ${response.status} ${errorBody}`);
  }
}

export async function sendNotification(event: NotificationEvent) {
  try {
    await sendViaResend(event);
    console.info("notification", event);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification failed.";
    console.error("notification_error", { message, event });
  }
}
