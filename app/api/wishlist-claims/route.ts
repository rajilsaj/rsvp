import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertWishlistClaimSchema } from "@/lib/schema";

export async function GET() {
  const claims = await storage.getWishlistClaims();
  return NextResponse.json(claims);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = insertWishlistClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid claim data" }, { status: 400 });
  }
  const claim = await storage.createWishlistClaim(parsed.data);
  return NextResponse.json(claim, { status: 201 });
}
