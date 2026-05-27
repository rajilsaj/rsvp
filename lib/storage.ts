import { getSheetRows, appendSheetRow, deleteSheetRow, RSVPS_SHEET, CLAIMS_SHEET } from "./google-sheets";
import type { Rsvp, InsertRsvp, WishlistClaim, InsertWishlistClaim } from "./schema";

const ALL_SEATS = [
  "t1s1", "t1s2", "t1s3", "t1s4",
  "t2s1", "t2s2", "t2s3", "t2s4",
  "t3s1", "t3s2", "t3s3", "t3s4",
];

// RSVPs sheet columns: id | name | phone | guests | status | notes | seatId | createdAt
function rowToRsvp(row: string[], index: number): Rsvp {
  return {
    id: parseInt(row[0]) || index + 1,
    name: row[1] ?? "",
    phone: row[2] ?? "",
    guests: parseInt(row[3]) || 1,
    status: row[4] ?? "maybe",
    notes: row[5] || null,
    seatId: row[6] || null,
    createdAt: row[7] || null,
  };
}

// WishlistClaims sheet columns: id | itemId | claimerName | createdAt
function rowToClaim(row: string[], index: number): WishlistClaim {
  return {
    id: parseInt(row[0]) || index + 1,
    itemId: row[1] ?? "",
    claimerName: row[2] ?? "",
    createdAt: row[3] || null,
  };
}

export interface IStorage {
  getRsvps(): Promise<Rsvp[]>;
  getRsvpByPhone(phone: string): Promise<Rsvp | null>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getWishlistClaims(): Promise<WishlistClaim[]>;
  createWishlistClaim(claim: InsertWishlistClaim): Promise<WishlistClaim>;
  deleteWishlistClaim(itemId: string): Promise<void>;
}

export class GoogleSheetStorage implements IStorage {
  async getRsvps(): Promise<Rsvp[]> {
    const rows = await getSheetRows(RSVPS_SHEET);
    return rows.map(rowToRsvp);
  }

  async getRsvpByPhone(phone: string): Promise<Rsvp | null> {
    const rsvps = await this.getRsvps();
    return rsvps.find(r => r.phone === phone) ?? null;
  }

  async createRsvp(data: InsertRsvp): Promise<Rsvp> {
    let seatId = data.seatId ?? null;
    if (!seatId && data.status === "yes") {
      const existing = await this.getRsvps();
      const taken = new Set(existing.map(r => r.seatId).filter(Boolean));
      seatId = ALL_SEATS.find(s => !taken.has(s)) ?? null;
    }
    const id = Date.now();
    const createdAt = new Date().toISOString();
    await appendSheetRow(RSVPS_SHEET, [
      String(id),
      data.name,
      data.phone,
      String(data.guests ?? 1),
      data.status,
      data.notes ?? "",
      seatId ?? "",
      createdAt,
    ]);
    return {
      id,
      name: data.name,
      phone: data.phone,
      guests: data.guests ?? 1,
      status: data.status,
      notes: data.notes ?? null,
      seatId,
      createdAt,
    };
  }

  async getWishlistClaims(): Promise<WishlistClaim[]> {
    const rows = await getSheetRows(CLAIMS_SHEET);
    return rows.map(rowToClaim);
  }

  async createWishlistClaim(data: InsertWishlistClaim): Promise<WishlistClaim> {
    const id = Date.now();
    const createdAt = new Date().toISOString();
    await appendSheetRow(CLAIMS_SHEET, [String(id), data.itemId, data.claimerName, createdAt]);
    return { id, itemId: data.itemId, claimerName: data.claimerName, createdAt };
  }

  async deleteWishlistClaim(itemId: string): Promise<void> {
    const rows = await getSheetRows(CLAIMS_SHEET);
    const rowIndex = rows.findIndex(row => row[1] === itemId);
    if (rowIndex === -1) return;
    // rows start at spreadsheet row 2 (row 1 is header), so absolute 0-based index = rowIndex + 1
    await deleteSheetRow(CLAIMS_SHEET, rowIndex + 1);
  }
}

export const storage = new GoogleSheetStorage();
