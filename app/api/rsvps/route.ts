import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertRsvpSchema } from "@/lib/schema";

export async function GET() {
  const rsvps = await storage.getRsvps();
  return NextResponse.json(rsvps);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = insertRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid RSVP data" }, { status: 400 });
  }
  const rsvp = await storage.createRsvp(parsed.data);
  return NextResponse.json(rsvp, { status: 201 });
}
