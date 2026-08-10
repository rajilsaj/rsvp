import { NextResponse } from "next/server";
import { getGuestHistory } from "@/lib/google-sheets";

export async function GET() {
  const history = await getGuestHistory();
  return NextResponse.json(history);
}
