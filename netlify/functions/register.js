const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');
const { sanitize, sanitizeEmail, sanitizePhone } = require('./lib/sanitize');
const { sendWhatsApp } = require('./lib/whatsapp');

// Allowed characters for redemption code (excludes O, 0, I, 1, L)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode() {
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(4);
  let code = 'MOD-';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '');

  // Handle CORS preflight
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Rate limit
  const ip = getClientIp(event);
  if (checkRateLimit(ip, 10)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Validate required fields
  const firstName = sanitize(body.first_name, 100);
  const lastName = sanitize(body.last_name, 100);
  const email = sanitizeEmail(body.email);
  const phone = sanitizePhone(body.mobile_phone);
  const churchName = sanitize(body.church_name, 200);
  const city = sanitize(body.city, 100);
  const language = body.preferred_language === 'en' ? 'en' : 'id';

  if (!firstName || !lastName || !email || !phone || !churchName || !city) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Harap isi semua bidang yang wajib.' }) };
  }

  const db = getSupabase();

  // Step 1: Duplicate check
  const { data: existing } = await db
    .from('people')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    // Update existing record
    await db.from('people').update({
      first_name: firstName,
      last_name: lastName,
      mobile_phone: phone,
      church_name: churchName,
      city: city,
      preferred_language: language,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);

    // Retrieve existing code
    const { data: existingCode } = await db
      .from('redemption_codes')
      .select('code')
      .eq('person_id', existing.id)
      .single();

    if (existingCode) {
      return { statusCode: 200, headers, body: JSON.stringify({ code: existingCode.code }) };
    }

    // No code exists yet — generate one for existing person
    const code = await generateUniqueCode(db);
    await db.from('redemption_codes').insert({
      code: code,
      person_id: existing.id
    });

    return { statusCode: 200, headers, body: JSON.stringify({ code: code }) };
  }

  // Step 2: New person — insert
  const { data: newPerson, error: insertErr } = await db
    .from('people')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile_phone: phone,
      church_name: churchName,
      city: city,
      person_origin: 'invested',
      preferred_language: language,
      hub_region: 'Southeast Asia',
      lifecycle_stage: 'book_buyer'
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('Insert person error:', insertErr);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Gagal mendaftarkan. Silakan coba lagi.' }) };
  }

  // Step 3: Generate unique redemption code
  const code = await generateUniqueCode(db);

  const { error: codeErr } = await db.from('redemption_codes').insert({
    code: code,
    person_id: newPerson.id
  });

  if (codeErr) {
    console.error('Insert code error:', codeErr);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Gagal membuat kode. Silakan coba lagi.' }) };
  }

  // Step 4: Send WhatsApp welcome message (session message — user just registered)
  sendWhatsApp(
    newPerson.id,
    phone,
    'registration_welcome',
    `Selamat datang! Kode buku Anda: ${code}. Tunjukkan kode ini di meja pendaftaran.`
  ).catch(err => console.error('WhatsApp send error:', err.message));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ code: code })
  };
};

async function generateUniqueCode(db) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const { data: collision } = await db
      .from('redemption_codes')
      .select('id')
      .eq('code', code)
      .single();

    if (!collision) return code;
  }
  throw new Error('Failed to generate unique code after 10 attempts');
}
