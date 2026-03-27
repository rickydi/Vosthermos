import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

export async function sendSms(to, body) {
  const client = getClient();
  if (!client || !fromNumber) {
    console.log("[Twilio] SMS skipped (not configured):", { to, body });
    return null;
  }
  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    return message.sid;
  } catch (error) {
    console.error("[Twilio] SMS error:", error);
    return null;
  }
}
