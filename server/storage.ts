import { rsvps, wishlistClaims, type Rsvp, type InsertRsvp, type WishlistClaim, type InsertWishlistClaim } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const ALL_SEATS = [
  "t1s1", "t1s2", "t1s3", "t1s4",
  "t2s1", "t2s2", "t2s3", "t2s4",
  "t3s1", "t3s2", "t3s3", "t3s4",
];

export interface IStorage {
  getRsvps(): Promise<Rsvp[]>;
  getRsvpByPhone(phone: string): Promise<Rsvp | null>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getWishlistClaims(): Promise<WishlistClaim[]>;
  createWishlistClaim(claim: InsertWishlistClaim): Promise<WishlistClaim>;
  deleteWishlistClaim(itemId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRsvps(): Promise<Rsvp[]> {
    return await db.select().from(rsvps);
  }

  async getRsvpByPhone(phone: string): Promise<Rsvp | null> {
    const [rsvp] = await db.select().from(rsvps).where(eq(rsvps.phone, phone));
    return rsvp || null;
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    // Auto-assign seat if not provided and status is 'yes'
    let seatId = insertRsvp.seatId;
    if (!seatId && insertRsvp.status === "yes") {
      const existingRsvps = await this.getRsvps();
      const takenSeats = new Set(existingRsvps.map(r => r.seatId).filter(Boolean));
      const availableSeat = ALL_SEATS.find(s => !takenSeats.has(s));
      if (availableSeat) {
        seatId = availableSeat;
      }
    }
    
    const [rsvp] = await db.insert(rsvps).values({ ...insertRsvp, seatId }).returning();
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
