const crypto = require('crypto');
const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');

// Vimeo IDs — update these when videos are uploaded
const VIMEO_IDS = {
  1: 'PLACEHOLDER_1',
  2: 'PLACEHOLDER_2',
  3: 'PLACEHOLDER_3',
  4: 'PLACEHOLDER_4',
  5: 'PLACEHOLDER_5'
};

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
  if (checkRateLimit(ip, 20)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { person_id, token, video_number } = body;
  if (!person_id || !token || !video_number) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const videoNum = parseInt(video_number);
  if (isNaN(videoNum) || videoNum < 1 || videoNum > 5) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid video number' }) };
  }

  const db = getSupabase();

  // Validate person and token
  const { data: person, error: fetchErr } = await db
    .from('people')
    .select('id, masterclass_access_token, lifecycle_stage, church_size')
    .eq('id', person_id)
    .single();

  if (fetchErr || !person) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
  }

  if (!person.masterclass_access_token || !safeCompare(token, person.masterclass_access_token)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
  }

  // Verify video is unlocked (drip logic)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  if (videoNum > 1 && videoNum <= 4) {
    const { data: prevProg } = await db
      .from('masterclass_progress')
      .select('started_at')
      .eq('person_id', person_id)
      .eq('video_number', videoNum - 1)
      .single();

    if (!prevProg || !prevProg.started_at) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Previous video not started' }) };
    }

    const unlockDate = new Date(new Date(prevProg.started_at).getTime() + SEVEN_DAYS_MS);
    if (new Date() < unlockDate) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Video not yet available' }) };
    }
  }

  if (videoNum === 5) {
    // Check Video 4 assignment completed and church size >= 100
    const isLargeChurch = ['100–300', '300–800', '800+'].includes(person.church_size);
    if (!isLargeChurch) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Video 5 not available' }) };
    }

    const { data: v4 } = await db
      .from('masterclass_progress')
      .select('assignment_submitted')
      .eq('person_id', person_id)
      .eq('video_number', 4)
      .single();

    if (!v4 || !v4.assignment_submitted) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Complete Video 4 first' }) };
    }
  }

  // Upsert progress record — only set started_at if not already set
  const { data: existing } = await db
    .from('masterclass_progress')
    .select('id, started_at')
    .eq('person_id', person_id)
    .eq('video_number', videoNum)
    .single();

  if (existing) {
    if (!existing.started_at) {
      await db.from('masterclass_progress')
        .update({ started_at: new Date().toISOString() })
        .eq('id', existing.id);
    }
  } else {
    await db.from('masterclass_progress').insert({
      person_id: person_id,
      video_number: videoNum,
      started_at: new Date().toISOString(),
      unlocked_at: new Date().toISOString()
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      vimeo_id: VIMEO_IDS[videoNum]
    })
  };
};
