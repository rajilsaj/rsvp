import { NextRequest, NextResponse } from "next/server";
import { appendGuestRsvp, findGuestByName, getGuests } from "@/lib/google-sheets";
import { z } from "zod";

export async function GET() {
  const guests = await getGuests();
  return NextResponse.json(guests);
}

const addGuestSchema = z.object({
  names: z.string().min(1),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  attending: z.enum(["", "yes", "no"]).default(""),
  plusOnes: z.number().int().min(0).max(10).default(0),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = addGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid guest data" }, { status: 400 });
  }

  const { names, phone, email, attending, plusOnes } = parsed.data;

  const existingGuest = await findGuestByName(names);
  if (existingGuest) {
    return NextResponse.json(
      { message: "A guest with that name already exists" },
      { status: 409 }
    );
  }

  const guest = await appendGuestRsvp({
    names,
    phone: phone ?? "",
    email: email ?? "",
    attending,
    plusOnes: attending === "yes" ? plusOnes : 0,
  });

  return NextResponse.json(guest, { status: 201 });
}
