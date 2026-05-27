import { NextResponse } from "next/server";
import { getGuests } from "@/lib/google-sheets";

export async function GET() {
  const guests = await getGuests();
  return NextResponse.json(guests);
}
