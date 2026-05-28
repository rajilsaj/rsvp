import { NextRequest, NextResponse } from "next/server";
import { appendGuestRsvp, findGuestByName } from "@/lib/google-sheets";
import { z } from "zod";

const rsvpSchema = z.object({
  names: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  attending: z.enum(["yes", "no"]),
  plusOnes: z.number().int().min(0).max(3).default(0),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Special check for real-time validation (onBlur)
  if (body.phone === "CHECK_ONLY" && body.names) {
    const existing = await findGuestByName(body.names);
    if (existing) {
      return NextResponse.json(existing);
    }
    // Return a 404 or specific status so the frontend knows they DON'T exist yet
    return NextResponse.json({ message: "Guest not found" }, { status: 404 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid RSVP data" }, { status: 400 });
  }

  const { names, phone, email, attending, plusOnes } = parsed.data;
  
  // Check if guest already exists by name
  const existingGuest = await findGuestByName(names);
  if (existingGuest) {
    return NextResponse.json(existingGuest);
  }

  const guest = await appendGuestRsvp({
    names,
    phone,
    email: email ?? "",
    attending,
    plusOnes: attending === "yes" ? plusOnes : 0,
  });

  return NextResponse.json(guest);
}
