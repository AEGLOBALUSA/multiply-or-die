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

  const { data, error } = await db
    .from('redemption_codes')
    .select('person_id, redeemed, redeemed_at, people(first_name, last_name, church_name)')
    .eq('code', code)
    .single();

  if (error || !data) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'invalid' })
    };
  }

  if (data.redeemed) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'collected',
        redeemed_at: data.redeemed_at
      })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'valid',
      first_name: data.people.first_name,
      last_name: data.people.last_name,
      church_name: data.people.church_name
    })
  };
};
