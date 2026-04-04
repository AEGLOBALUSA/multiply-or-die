const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { sendWhatsApp } = require('./lib/whatsapp');

/**
 * Internal utility endpoint for sending WhatsApp messages.
 * Not called directly by frontend — called by other functions or for manual testing.
 * POST { person_id, message_type, body }
 */
exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { person_id, message_type, message_body } = body;
  if (!person_id || !message_type || !message_body) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const db = getSupabase();

  // Look up person's phone number
  const { data: person, error } = await db
    .from('people')
    .select('mobile_phone')
    .eq('id', person_id)
    .single();

  if (error || !person || !person.mobile_phone) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found or no phone number' }) };
  }

  const result = await sendWhatsApp(person_id, person.mobile_phone, message_type, message_body);

  if (result === null) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true, reason: 'Already sent' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message_sid: result })
  };
};
