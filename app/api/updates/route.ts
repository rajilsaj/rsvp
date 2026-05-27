import { NextRequest, NextResponse } from "next/server";
import { getGuests, getUpdates, appendUpdate } from "@/lib/google-sheets";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const updateSchema = z.object({
  message: z.string().min(1),
  photoAlbumLink: z.string().optional().default(""),
  target: z.enum(["all", "confirmed"]),
});

export async function GET() {
  const updates = await getUpdates();
  return NextResponse.json(updates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const { message, photoAlbumLink, target } = parsed.data;

  const allGuests = await getGuests();
  const targeted =
    target === "confirmed"
      ? allGuests.filter((g) => g.attending === "yes")
      : allGuests;

  const eligible = targeted.filter((g) => !g.optOut);

  const smsBody = [
    `Grace & Noelvie Wedding: ${message}`,
    photoAlbumLink ? `Photos: ${photoAlbumLink}` : "",
    "Reply STOP to unsubscribe.",
  ]
    .filter(Boolean)
    .join(" ");

  const emailHtml = buildEmailHtml(message, photoAlbumLink);

  let smsSent = 0;
  let emailSent = 0;
  let errors = 0;

  await Promise.allSettled(
    eligible.flatMap((g) => {
      const tasks: Promise<void>[] = [];
      if (g.phone) {
        tasks.push(
          sendSMS(g.phone, smsBody)
            .then(() => { smsSent++; })
            .catch(() => { errors++; })
        );
      }
      if (g.email) {
        tasks.push(
          sendEmail(g.email, "Grace & Noelvie — Wedding Update", emailHtml)
            .then(() => { emailSent++; })
            .catch(() => { errors++; })
        );
      }
      return tasks;
    })
  );

  const sentTo = `${target} (${smsSent} SMS, ${emailSent} emails)`;
  await appendUpdate({
    date: new Date().toLocaleDateString("en-US"),
    message,
    photoAlbumLink: photoAlbumLink ?? "",
    sentTo,
    sentAt: new Date().toISOString(),
  });

  return NextResponse.json({ smsSent, emailSent, errors });
}

function buildEmailHtml(message: string, photoAlbumLink?: string): string {
  return `
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;background:#faf9f7;padding:40px;border-radius:16px;">
      <h2 style="font-family:Georgia,serif;color:#5a1a1a;font-size:28px;margin:0 0 24px;">Grace &amp; Noelvie</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;white-space:pre-line;">${message}</p>
      ${photoAlbumLink
        ? `<a href="${photoAlbumLink}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#5a1a1a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;">View Photo Album →</a>`
        : ""
      }
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 20px;" />
      <p style="color:#9ca3af;font-size:12px;">
        You received this message because you are an invited guest to the wedding of Grace &amp; Noelvie — June 20, 2026.
      </p>
    </div>
  `;
}
