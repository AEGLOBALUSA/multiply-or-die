const { getSupabase } = require('./supabase');

let twilioClient;

function getTwilio() {
  if (!twilioClient) {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

/**
 * Check if a message of this type has already been sent to this person.
 */
async function alreadySent(personId, messageType) {
  const db = getSupabase();
  const { data } = await db
    .from('whatsapp_log')
    .select('id')
    .eq('person_id', personId)
    .eq('message_type', messageType)
    .limit(1);
  return data && data.length > 0;
}

/**
 * Send a WhatsApp message and log it. Skips if already sent (dedup).
 * @param {string} personId - UUID of the person
 * @param {string} toNumber - WhatsApp number (with country code)
 * @param {string} messageType - Type identifier for dedup
 * @param {string} body - Message body text
 * @returns {object|null} - Twilio message result or null if skipped
 */
async function sendWhatsApp(personId, toNumber, messageType, body) {
  if (await alreadySent(personId, messageType)) {
    return null;
  }

  const db = getSupabase();
  let messageSid = null;

  try {
    const client = getTwilio();
    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${toNumber}`,
      body: body
    });
    messageSid = result.sid;
  } catch (err) {
    console.error(`WhatsApp send failed for ${messageType}:`, err.message);
  }

  await db.from('whatsapp_log').insert({
    person_id: personId,
    message_type: messageType,
    twilio_message_sid: messageSid
  });

  return messageSid;
}

module.exports = { sendWhatsApp, alreadySent, getTwilio };
