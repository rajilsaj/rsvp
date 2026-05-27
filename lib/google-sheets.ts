import { google } from "googleapis";

export const RSVPS_SHEET = "RSVPs";
export const CLAIMS_SHEET = "WishlistClaims";

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  }
  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    throw new Error("GOOGLE_SPREADSHEET_ID is not set");
  }
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSpreadsheetId(): string {
  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    throw new Error("GOOGLE_SPREADSHEET_ID is not set");
  }
  return process.env.GOOGLE_SPREADSHEET_ID;
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export async function getSheetRows(sheetName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A2:Z`,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function appendSheetRow(sheetName: string, values: string[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function deleteSheetRow(sheetName: string, rowIndex: number): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = meta.data.sheets
    ?.find(s => s.properties?.title === sheetName)
    ?.properties?.sheetId;

  if (sheetId == null) throw new Error(`Sheet "${sheetName}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });
}
