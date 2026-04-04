const crypto = require('crypto');
const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');
const { sanitize } = require('./lib/sanitize');
const { sendWhatsApp } = require('./lib/whatsapp');

// Valid dropdown values for each field
const VALID_VALUES = {
  church_size: ['Under 50', '50–100', '100–300', '300–800', '800+'],
  years_in_ministry: ['0–2', '3–5', '6–10', '11–20', '20+'],
  leadership_role: ['Senior Pastor', 'Associate Pastor', 'Church Planter', 'Ministry Leader', 'Other'],
  biggest_challenge: ['Growing past current size', 'Developing leaders', 'Building systems', 'Funding and resources', 'Personal burnout'],
  team_size: ['0 (solo)', '1–3', '4–10', '11–25', '25+'],
  training_preference: ['Video', 'Written guides', 'Live workshops', 'One-on-one coaching', 'Peer groups']
};

const PROFILE_FIELDS = Object.keys(VALID_VALUES);

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '', 'GET, POST, OPTIONS');
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  const db = getSupabase();

  // GET — fetch profile data for pre-population
  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing person ID' }) };
    }

    const { data: person, error } = await db
      .from('people')
      .select('first_name, last_name, church_size, years_in_ministry, leadership_role, biggest_challenge, team_size, training_preference, profile_fields_completed, lifecycle_stage')
      .eq('id', id)
      .single();

    if (error || !person) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(person) };
  }

  // POST — submit profile fields
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIp(event);
  if (checkRateLimit(ip, 10)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const personId = body.person_id;
  if (!personId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing person ID' }) };
  }

  // Fetch existing person
  const { data: person, error: fetchErr } = await db
    .from('people')
    .select('id, first_name, mobile_phone, lifecycle_stage, masterclass_access_token')
    .eq('id', personId)
    .single();

  if (fetchErr || !person) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
  }

  // Build update object with validated fields
  const updates = { updated_at: new Date().toISOString() };
  let fieldsCompleted = 0;

  for (const field of PROFILE_FIELDS) {
    const value = sanitize(body[field], 100);
    if (value && VALID_VALUES[field].includes(value)) {
      updates[field] = value;
      fieldsCompleted++;
    } else {
      // Check if already filled from a previous submission
      const { data: existing } = await db
        .from('people')
        .select(field)
        .eq('id', personId)
        .single();
      if (existing && existing[field]) {
        fieldsCompleted++;
      }
    }
  }

  updates.profile_fields_completed = fieldsCompleted;

  // Check if 4+ fields unlocks masterclass
  let masterclassUnlocked = false;
  if (fieldsCompleted >= 4 && person.lifecycle_stage === 'book_buyer') {
    const token = crypto.randomUUID();
    updates.lifecycle_stage = 'masterclass_unlocked';
    updates.masterclass_access_token = token;
    masterclassUnlocked = true;

    // Check roundtable eligibility based on church_size
    const churchSize = updates.church_size || body.church_size;
    if (churchSize === '100–300' || churchSize === '300–800' || churchSize === '800+') {
      updates.roundtable_eligible = true;
    }
  }

  // Update person record
  const { error: updateErr } = await db
    .from('people')
    .update(updates)
    .eq('id', personId);

  if (updateErr) {
    console.error('Profile update error:', updateErr);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save profile.' }) };
  }

  // Send WhatsApp if masterclass unlocked
  if (masterclassUnlocked && person.mobile_phone) {
    const siteUrl = process.env.SITE_URL || 'https://multiplyordie.com';
    const link = `${siteUrl}/masterclass?id=${personId}&token=${updates.masterclass_access_token}`;
    sendWhatsApp(
      personId,
      person.mobile_phone,
      'masterclass_unlock',
      `Masterclass Anda telah dibuka! Mulai Video 1 sekarang: ${link}`
    ).catch(err => console.error('WhatsApp masterclass unlock error:', err.message));
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      profile_fields_completed: fieldsCompleted,
      masterclass_unlocked: masterclassUnlocked
    })
  };
};
