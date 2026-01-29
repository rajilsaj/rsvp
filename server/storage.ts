import { rsvps, wishlistClaims, type Rsvp, type InsertRsvp, type WishlistClaim, type InsertWishlistClaim } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRsvps(): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getWishlistClaims(): Promise<WishlistClaim[]>;
  createWishlistClaim(claim: InsertWishlistClaim): Promise<WishlistClaim>;
  deleteWishlistClaim(itemId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRsvps(): Promise<Rsvp[]> {
    return await db.select().from(rsvps);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const [rsvp] = await db.insert(rsvps).values(insertRsvp).returning();
    return rsvp;
  }

  async getWishlistClaims(): Promise<WishlistClaim[]> {
    return await db.select().from(wishlistClaims);
  }

  async createWishlistClaim(claim: InsertWishlistClaim): Promise<WishlistClaim> {
    const [newClaim] = await db.insert(wishlistClaims).values(claim).returning();
    return newClaim;
  }

  async deleteWishlistClaim(itemId: string): Promise<void> {
    await db.delete(wishlistClaims).where(eq(wishlistClaims.itemId, itemId));
  }
}

export const storage = new DatabaseStorage();
