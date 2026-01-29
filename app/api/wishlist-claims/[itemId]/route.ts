import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  await storage.deleteWishlistClaim(itemId);
  return new NextResponse(null, { status: 204 });
}
