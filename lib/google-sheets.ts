import { google } from "googleapis";
import { randomUUID } from "crypto";

const GUESTS_SHEET = "Guests";
const UPDATES_SHEET = "Updates";

/**
 * Columns in 'Guests' sheet:
 * 0: Id
 * 1: Names
 * 2: Phone
 * 3: Email
 * 4: Token
 * 5: Sent
 * 6: Clicked
 * 7: Attending
 * 8: PlusOnes
 * 9: Table
 * 10: Seats
 * 11: OptOut
 */
const COL = {
  ID: 0,
  NAMES: 1,
  PHONE: 2,
  EMAIL: 3,
  TOKEN: 4,
  SENT: 5,
  CLICKED: 6,
  ATTENDING: 7,
  PLUS_ONES: 8,
  TABLE: 9,
  SEATS: 10,
  OPT_OUT: 11,
} as const;

const UPDATE_COL = {
  ID: 0,
  DATE: 1,
  MESSAGE: 2,
  PHOTO_ALBUM_LINK: 3,
  SENT_TO: 4,
  SENT_AT: 5,
} as const;

export type Guest = {
  row: number;
  id: string;
  names: string;
  phone: string;
  email: string;
  token: string;
  sent: string;
  clicked: string;
  attending: string;
  plusOnes: number;
  table: string;
  seats: string;
  optOut: boolean;
};

export type Update = {
  id: string;
  date: string;
  message: string;
  photoAlbumLink: string;
  sentTo: string;
  sentAt: string;
};

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google service account credentials");
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function spreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID is not set");
  return id;
}

function sheetsApi() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function colLetter(index: number): string {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

function parseBool(val: string | undefined): boolean {
  const v = val?.toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function rowToGuest(raw: string[], index: number): Guest {
  return {
    row: index + 2,
    id: raw[COL.ID] ?? "",
    names: raw[COL.NAMES] ?? "",
    phone: raw[COL.PHONE] ?? "",
    email: raw[COL.EMAIL] ?? "",
    token: raw[COL.TOKEN] ?? "",
    sent: raw[COL.SENT] ?? "",
    clicked: raw[COL.CLICKED] ?? "",
    attending: raw[COL.ATTENDING] ?? "",
    plusOnes: parseInt(raw[COL.PLUS_ONES] ?? "0") || 0,
    table: raw[COL.TABLE] ?? "",
    seats: raw[COL.SEATS] ?? "",
    optOut: parseBool(raw[COL.OPT_OUT]),
  };
}

export async function getGuests(): Promise<Guest[]> {
  const res = await sheetsApi().spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${GUESTS_SHEET}!A2:L`,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows.map(rowToGuest);
}

export async function findGuestByName(names: string): Promise<Guest | null> {
  const guests = await getGuests();
  const searchName = names.trim().toLowerCase();
  return guests.find(g => g.names.trim().toLowerCase() === searchName) ?? null;
}

async function updateCellRange(
  sheet: string,
  row: number,
  startCol: number,
  values: string[]
): Promise<void> {
  const start = colLetter(startCol);
  const end = colLetter(startCol + values.length - 1);
  await sheetsApi().spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${sheet}!${start}${row}:${end}${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function appendGuestRsvp(guest: {
  names: string;
  phone: string;
  email: string;
  attending: string;
  plusOnes: number;
}): Promise<Omit<Guest, "row" | "table" | "seats" | "optOut">> {
  const id = randomUUID();
  const token = randomUUID().split("-")[0]; // Simple 8-char token
  
  const guestData = {
    id,
    names: guest.names,
    phone: guest.phone,
    email: guest.email,
    token,
    sent: "FALSE",
    clicked: "FALSE",
    attending: guest.attending,
    plusOnes: guest.plusOnes,
  };
  
  await sheetsApi().spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${GUESTS_SHEET}!A:L`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        id, 
        guest.names, 
        guest.phone, 
        guest.email, 
        token, 
        "FALSE", 
        "FALSE", 
        guest.attending,
        String(guest.plusOnes), 
        "", 
        "", 
        "FALSE",
      ]],
    },
  });

  return guestData;
}

export async function updateGuestSeating(
  row: number,
  table: string,
  seats: string
): Promise<void> {
  await updateCellRange(GUESTS_SHEET, row, COL.TABLE, [table, seats]);
}

export async function getUpdates(): Promise<Update[]> {
  const res = await sheetsApi().spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${UPDATES_SHEET}!A2:F`,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows.map((row) => ({
    id: row[UPDATE_COL.ID] ?? "",
    date: row[UPDATE_COL.DATE] ?? "",
    message: row[UPDATE_COL.MESSAGE] ?? "",
    photoAlbumLink: row[UPDATE_COL.PHOTO_ALBUM_LINK] ?? "",
    sentTo: row[UPDATE_COL.SENT_TO] ?? "",
    sentAt: row[UPDATE_COL.SENT_AT] ?? "",
  }));
}

export async function appendUpdate(update: Omit<Update, "id">): Promise<void> {
  const id = randomUUID();
  await sheetsApi().spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${UPDATES_SHEET}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        id, update.date, update.message, update.photoAlbumLink, update.sentTo, update.sentAt,
      ]],
    },
  });
}
