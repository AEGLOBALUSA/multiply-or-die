const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');
const { sanitize } = require('./lib/sanitize');

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIp(event);
  if (checkRateLimit(ip, 30)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const code = sanitize(body.code, 10).toUpperCase();
  if (!code || !code.startsWith('MOD-')) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid code format' }) };
  }

  const db = getSupabase();

  // Verify code exists and not already redeemed
  const { data: codeRecord, error: lookupErr } = await db
    .from('redemption_codes')
    .select('id, person_id, redeemed')
    .eq('code', code)
    .single();

  if (lookupErr || !codeRecord) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Code not found' }) };
  }

  if (codeRecord.redeemed) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: 'Already collected' }) };
  }

  // Mark as collected
  const now = new Date().toISOString();

  const { error: updateErr } = await db
    .from('redemption_codes')
    .update({ redeemed: true, redeemed_at: now })
    .eq('id', codeRecord.id);

  if (updateErr) {
    console.error('Mark collected error:', updateErr);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to update' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, redeemed_at: now })
  };
};
