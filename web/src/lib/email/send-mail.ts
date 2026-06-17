export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendMail(
  input: SendMailInput,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.CONTACT_FROM_EMAIL ??
    process.env.DIGEST_FROM_EMAIL ??
    "DataBloomer <support@databloomer.com>";

  if (!apiKey) {
    return { sent: false, reason: "Email is not configured on the server." };
  }

  const to = Array.isArray(input.to) ? input.to : [input.to];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: `Email error ${response.status}: ${body}` };
  }

  return { sent: true };
}

export function getContactInbox(): string | null {
  return process.env.CONTACT_TO_EMAIL?.trim() || null;
}
