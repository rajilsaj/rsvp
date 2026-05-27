import twilio from "twilio";

export async function sendSMS(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) {
    throw new Error("Missing Twilio credentials");
  }
  const client = twilio(accountSid, authToken);
  await client.messages.create({ to, from, body: message });
}
