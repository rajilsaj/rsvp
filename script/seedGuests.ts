/**
 * Adds test guests to the Guests sheet.
 * Run with:
 *   node --env-file .env.local --import tsx/esm script/seedGuests.ts
 */

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

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

const TEST_GUESTS = [
  // Name, Phone, Email, Token, Sent, Clicked, Attending, PlusOnes, Table, Seats, OptOut
  ["Alice Dupont",   "+19195550101", "alice@example.com",   "tok-alice",   "false", "false", "", "0", "", "", "false"],
  ["Bob Martin",     "+19195550102", "bob@example.com",     "tok-bob",     "false", "false", "", "0", "", "", "false"],
  ["Claire Leblanc", "+19195550103", "claire@example.com",  "tok-claire",  "false", "false", "", "0", "", "", "false"],
];

async function main() {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Guests!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: TEST_GUESTS },
  });

  console.log(`Added ${TEST_GUESTS.length} test guests.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
