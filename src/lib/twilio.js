import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

export async function sendSmsDetailed(to, body) {
  const client = getClient();
  if (!client || !fromNumber) {
    console.warn("[Twilio] SMS skipped: service not configured");
    return { status: "unavailable", sid: null, providerStatus: null, errorCode: "not_configured", errorMessage: "Service texto non configuré" };
  }
  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    const providerStatus = message.status || "queued";
    const failed = ["failed", "undelivered", "canceled"].includes(providerStatus);
    return {
      status: failed ? "failed" : "accepted",
      sid: message.sid,
      providerStatus,
      errorCode: message.errorCode || null,
      errorMessage: failed ? "Twilio n’a pas accepté le texto" : null,
    };
  } catch (error) {
    console.error("[Twilio] SMS error:", {
      code: error?.code || null,
      status: error?.status || null,
    });
    return {
      status: "failed",
      sid: null,
      providerStatus: null,
      errorCode: error?.code || null,
      errorMessage: "Erreur Twilio",
    };
  }
}

export async function sendSms(to, body) {
  const result = await sendSmsDetailed(to, body);
  return result.sid;
}
