const ALLOWED_ORIGINS = [
  'https://multiplyordie.com',
  'https://www.multiplyordie.com',
  'http://localhost:8888',
  'http://localhost:3000'
];

function getAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

function corsHeaders(origin, methods = 'POST, OPTIONS') {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(event.headers.origin || ''),
      body: ''
    };
  }
  return null;
}

module.exports = { ALLOWED_ORIGINS, getAllowedOrigin, corsHeaders, handleOptions };
