import { NextRequest, NextResponse } from "next/server";
import { getGuests, updateGuestSeating } from "@/lib/google-sheets";
import { z } from "zod";

const seatSchema = z.object({
  row: z.number().int().min(2),
  table: z.string(),
  seats: z.string(),
});

export async function GET() {
  const guests = await getGuests();
  return NextResponse.json(guests.filter((g) => g.attending === "yes"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = seatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid seating data" }, { status: 400 });
  }

  const { row, table, seats } = parsed.data;
  await updateGuestSeating(row, table, seats);
  return NextResponse.json({ success: true });
}
