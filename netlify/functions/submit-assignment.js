const crypto = require('crypto');
const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');
const { sanitize } = require('./lib/sanitize');
const { sendWhatsApp } = require('./lib/whatsapp');

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
  if (checkRateLimit(ip, 10)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { person_id, token, video_number, assignment_text } = body;
  if (!person_id || !token || !video_number) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const videoNum = parseInt(video_number);
  const text = sanitize(assignment_text, 5000);

  if (!text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Assignment text is required' }) };
  }

  const db = getSupabase();

  // Validate person and token
  const { data: person, error: fetchErr } = await db
    .from('people')
    .select('id, masterclass_access_token, church_size, mobile_phone, lifecycle_stage')
    .eq('id', person_id)
    .single();

  if (fetchErr || !person) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
  }

  if (!person.masterclass_access_token || !safeCompare(token, person.masterclass_access_token)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
  }

  // Update progress record
  const now = new Date().toISOString();
  const { data: progress } = await db
    .from('masterclass_progress')
    .select('id')
    .eq('person_id', person_id)
    .eq('video_number', videoNum)
    .single();

  if (!progress) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Video not started' }) };
  }

  await db.from('masterclass_progress')
    .update({
      assignment_submitted: true,
      assignment_text: text,
      completed_at: now
    })
    .eq('id', progress.id);

  // Check completion triggers
  const isLargeChurch = ['100–300', '300–800', '800+'].includes(person.church_size);
  const siteUrl = process.env.SITE_URL || 'https://multiply-or-die.com';
  let nextAction = null;

  if (videoNum === 4) {
    if (isLargeChurch) {
      // Unlock Video 5 — send WhatsApp
      nextAction = 'video_5_unlocked';
      if (person.mobile_phone) {
        const link = `${siteUrl}/masterclass?id=${person_id}&token=${person.masterclass_access_token}`;
        sendWhatsApp(
          person_id,
          person.mobile_phone,
          'masterclass_complete_100plus',
          `Selamat! Anda telah menyelesaikan Masterclass. Video spesial dari Ashley menunggu Anda: ${link}`
        ).catch(err => console.error('WhatsApp V5 unlock error:', err.message));
      }
    } else {
      // Under-100 completion
      nextAction = 'masterclass_complete_under100';
      await db.from('people')
        .update({ lifecycle_stage: 'masterclass_complete', updated_at: now })
        .eq('id', person_id);

      if (person.mobile_phone) {
        sendWhatsApp(
          person_id,
          person.mobile_phone,
          'masterclass_complete_under100',
          'Selamat! Anda telah menyelesaikan Masterclass Multiply or Die. Terus bertumbuh dan terapkan apa yang telah Anda pelajari. Ketika gereja Anda mencapai 100 orang, kami akan mengundang Anda ke Roundtable. Kami mengawasi Anda!'
        ).catch(err => console.error('WhatsApp under-100 complete error:', err.message));
      }
    }
  }

  if (videoNum === 5) {
    // Full masterclass complete (100+ church)
    nextAction = 'roundtable_ready';
    await db.from('people')
      .update({ lifecycle_stage: 'masterclass_complete', updated_at: now })
      .eq('id', person_id);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      next_action: nextAction
    })
  };
};
