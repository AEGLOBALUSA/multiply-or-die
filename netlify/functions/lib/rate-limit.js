const ipHits = {};

function checkRateLimit(ip, maxPerMin = 30) {
  const now = Date.now();
  if (!ipHits[ip]) ipHits[ip] = [];
  ipHits[ip] = ipHits[ip].filter(t => now - t < 60000);
  if (ipHits[ip].length >= maxPerMin) return true;
  ipHits[ip].push(now);
  if (Object.keys(ipHits).length > 500) {
    for (const k of Object.keys(ipHits)) {
      if (ipHits[k].every(t => now - t >= 60000)) delete ipHits[k];
    }
  }
  return false;
}

function getClientIp(event) {
  return event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
}

module.exports = { checkRateLimit, getClientIp };
