import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  
  if (!phone) {
    return NextResponse.json({ message: "Phone number required" }, { status: 400 });
  }
  
  const rsvp = await storage.getRsvpByPhone(phone);
  if (!rsvp) {
    return NextResponse.json({ message: "RSVP not found" }, { status: 404 });
  }
  
  return NextResponse.json(rsvp);
}
