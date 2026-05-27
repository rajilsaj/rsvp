import { z } from "zod";

export const insertRsvpSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  guests: z.number().int().min(1).default(1),
  status: z.enum(["yes", "no", "maybe"]),
  notes: z.string().optional().nullable(),
  seatId: z.string().optional().nullable(),
});

export const insertWishlistClaimSchema = z.object({
  itemId: z.string().min(1),
  claimerName: z.string().min(1),
});

export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type InsertWishlistClaim = z.infer<typeof insertWishlistClaimSchema>;

export type Rsvp = {
  id: number;
  name: string;
  phone: string;
  guests: number;
  status: string;
  notes: string | null;
  seatId: string | null;
  createdAt: string | null;
};

export type WishlistClaim = {
  id: number;
  itemId: string;
  claimerName: string;
  createdAt: string | null;
};
