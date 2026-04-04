function sanitize(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

function sanitizeEmail(str) {
  const email = sanitize(str, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function sanitizePhone(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\d+]/g, '').slice(0, 20);
}

module.exports = { sanitize, sanitizeEmail, sanitizePhone };
