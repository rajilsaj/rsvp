import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRsvpSchema, insertWishlistClaimSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/rsvps", async (_req, res) => {
    const rsvps = await storage.getRsvps();
    res.json(rsvps);
  });

  app.post("/api/rsvps", async (req, res) => {
    const parsed = insertRsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid RSVP data" });
    }
    const rsvp = await storage.createRsvp(parsed.data);
    res.status(201).json(rsvp);
  });

  app.get("/api/wishlist-claims", async (_req, res) => {
    const claims = await storage.getWishlistClaims();
    res.json(claims);
  });

  app.post("/api/wishlist-claims", async (req, res) => {
    const parsed = insertWishlistClaimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid claim data" });
    }
    const claim = await storage.createWishlistClaim(parsed.data);
    res.status(201).json(claim);
  });

  app.delete("/api/wishlist-claims/:itemId", async (req, res) => {
    await storage.deleteWishlistClaim(req.params.itemId);
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
