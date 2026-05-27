import { Resend } from "resend";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "Grace & Noelvie <noreply@resend.dev>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  const resend = new Resend(apiKey);
  await resend.emails.send({ from: FROM, to, subject, html });
}
