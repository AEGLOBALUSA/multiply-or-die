const { getSupabase } = require('./supabase');

/**
 * Wati WhatsApp API integration.
 * Replaces Twilio — uses simple REST calls with Bearer token auth.
 *
 * Session messages: free-form text within 24h of user's last inbound message.
 * Template messages: for outbound messages outside the 24h window (needs Meta approval).
 */

const WATI_API_URL = process.env.WATI_API_URL || 'https://live-mt-server.wati.io/api/v1';
const WATI_API_TOKEN = process.env.WATI_API_TOKEN;

/**
 * Send a session message (free-form text, within 24h window).
 */
async function watiSessionMessage(phone, text) {
  const cleanPhone = normalizePhone(phone);
  const res = await fetch(`${WATI_API_URL}/sendSessionMessage/${cleanPhone}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WATI_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messageText: text })
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Wati session message failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

/**
 * Send a template message (for outbound outside 24h window).
 * @param {string} phone - E.164 phone number
 * @param {string} templateName - Meta-approved template name
 * @param {Array} parameters - Array of {name, value} objects for template variables
 */
async function watiTemplateMessage(phone, templateName, parameters = []) {
  const cleanPhone = normalizePhone(phone);
  const res = await fetch(`${WATI_API_URL}/sendTemplateMessage/${cleanPhone}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WATI_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_name: templateName,
      broadcast_name: `mod_${templateName}_${Date.now()}`,
      parameters: parameters
    })
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Wati template message failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

/**
 * Normalize phone to E.164 without whatsapp: prefix.
 * Strips spaces, dashes, and the whatsapp: prefix if present.
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone
    .replace(/^whatsapp:/i, '')
    .replace(/[\s\-()]/g, '')
    .replace(/^\+/, '');
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
 *
 * Uses session messages for immediate triggers (user just interacted),
 * and template messages for cron/scheduled outbound.
 *
 * @param {string} personId - UUID of the person
 * @param {string} toNumber - Phone number (with country code)
 * @param {string} messageType - Type identifier for dedup
 * @param {string} body - Message body text
 * @param {object} [options] - Optional: { useTemplate: true, templateName: '...', parameters: [...] }
 * @returns {string|null} - Wati message ID or null if skipped
 */
async function sendWhatsApp(personId, toNumber, messageType, body, options = {}) {
  if (await alreadySent(personId, messageType)) {
    return null;
  }

  const db = getSupabase();
  let messageId = null;

  try {
    let result;
    if (options.useTemplate && options.templateName) {
      result = await watiTemplateMessage(toNumber, options.templateName, options.parameters || []);
    } else {
      result = await watiSessionMessage(toNumber, body);
    }
    messageId = result?.id || result?.messageId || 'sent';
  } catch (err) {
    console.error(`WhatsApp send failed for ${messageType}:`, err.message);
  }

  await db.from('whatsapp_log').insert({
    person_id: personId,
    message_type: messageType,
    twilio_message_sid: messageId
  });

  return messageId;
}

module.exports = { sendWhatsApp, alreadySent, watiSessionMessage, watiTemplateMessage, normalizePhone };
