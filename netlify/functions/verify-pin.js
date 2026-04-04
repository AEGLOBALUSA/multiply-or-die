const crypto = require('crypto');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIp(event);
  if (checkRateLimit(ip, 5)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many attempts. Please wait.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const pin = String(body.pin || '').trim();
  const correctPin = process.env.DESK_PIN || '0000';

  // Pad both to same length for timing-safe comparison
  const padded = pin.padEnd(correctPin.length, '\0');

  if (!safeCompare(padded, correctPin)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid PIN' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
