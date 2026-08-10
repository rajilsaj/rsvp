import { NextRequest, NextResponse } from "next/server";
import {
  appendGuestHistory,
  appendGuestRsvp,
  deleteGuestRow,
  findGuestById,
  findGuestByName,
  getGuests,
  updateGuestAttending,
  updateGuestPlusOnes,
} from "@/lib/google-sheets";
import { z } from "zod";

function attendingLabel(attending: string): string {
  return attending === "yes" ? "Attending" : attending === "no" ? "Not attending" : "Pending";
}

async function logHistory(action: string, guestNames: string, details: string) {
  try {
    await appendGuestHistory({ action, guestNames, details });
  } catch (err) {
    // History is best-effort — never fail the main operation
    console.error("Failed to log guest history:", err);
  }
}

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

  await logHistory(
    "Guest added",
    names,
    attending === "yes"
      ? `Attending, +Ones: ${plusOnes}`
      : attendingLabel(attending)
  );

  return NextResponse.json(guest, { status: 201 });
}

const deleteGuestSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = deleteGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid delete request" }, { status: 400 });
  }

  const guest = await findGuestById(parsed.data.id);
  if (!guest) {
    return NextResponse.json({ message: "Guest not found" }, { status: 404 });
  }

  await deleteGuestRow(guest.row);

  await logHistory(
    "Guest removed",
    guest.names,
    `Was ${attendingLabel(guest.attending).toLowerCase()}${
      guest.plusOnes > 0 ? ` with ${guest.plusOnes} +One${guest.plusOnes > 1 ? "s" : ""}` : ""
    }`
  );

  return NextResponse.json({ success: true });
}

const patchGuestSchema = z
  .object({
    id: z.string().min(1),
    plusOnes: z.number().int().min(0).max(10).optional(),
    attending: z.enum(["", "yes", "no"]).optional(),
  })
  .refine((d) => d.plusOnes !== undefined || d.attending !== undefined, {
    message: "Nothing to update",
  });

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = patchGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update request" }, { status: 400 });
  }

  const guest = await findGuestById(parsed.data.id);
  if (!guest) {
    return NextResponse.json({ message: "Guest not found" }, { status: 404 });
  }

  const { attending, plusOnes } = parsed.data;
  if (attending !== undefined && attending !== guest.attending) {
    await updateGuestAttending(guest.row, attending);
    await logHistory(
      "RSVP changed",
      guest.names,
      `${attendingLabel(guest.attending)} → ${attendingLabel(attending)}${
        attending !== "yes" && guest.plusOnes > 0
          ? ` (${guest.plusOnes} +One${guest.plusOnes > 1 ? "s" : ""} removed)`
          : ""
      }`
    );
  }
  if (plusOnes !== undefined && plusOnes !== guest.plusOnes) {
    await updateGuestPlusOnes(guest.row, plusOnes);
    await logHistory("+Ones changed", guest.names, `${guest.plusOnes} → ${plusOnes}`);
  }
  return NextResponse.json({ success: true });
}
