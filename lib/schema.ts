import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  guests: integer("guests").notNull().default(1),
  status: text("status").notNull(),
  notes: text("notes"),
  seatId: text("seat_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlistClaims = pgTable("wishlist_claims", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull(),
  claimerName: text("claimer_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({ id: true, createdAt: true });
export const insertWishlistClaimSchema = createInsertSchema(wishlistClaims).omit({ id: true, createdAt: true });

export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type WishlistClaim = typeof wishlistClaims.$inferSelect;
export type InsertWishlistClaim = z.infer<typeof insertWishlistClaimSchema>;
