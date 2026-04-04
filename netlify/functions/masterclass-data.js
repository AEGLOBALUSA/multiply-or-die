const crypto = require('crypto');
const { getSupabase } = require('./lib/supabase');
const { corsHeaders, handleOptions } = require('./lib/cors');
const { checkRateLimit, getClientIp } = require('./lib/rate-limit');

// Video metadata — Vimeo IDs will be populated when videos are uploaded
const VIDEOS = [
  { number: 1, title: 'Hukum Penambahan vs Hukum Perkalian', vimeo_id: 'PLACEHOLDER_1' },
  { number: 2, title: 'Audit Penambahan: Di Mana Anda Terjebak', vimeo_id: 'PLACEHOLDER_2' },
  { number: 3, title: 'Kerangka H.E.A.T. untuk Mengembangkan Pemimpin', vimeo_id: 'PLACEHOLDER_3' },
  { number: 4, title: 'Arsitektur Dua Belas Suku', vimeo_id: 'PLACEHOLDER_4' },
  { number: 5, title: 'Undangan Roundtable dari Ashley', vimeo_id: 'PLACEHOLDER_5' }
];

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin || '', 'GET, OPTIONS');
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIp(event);
  if (checkRateLimit(ip, 30)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests.' }) };
  }

  const id = event.queryStringParameters?.id;
  const token = event.queryStringParameters?.token;

  if (!id || !token) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing credentials' }) };
  }

  const db = getSupabase();

  // Fetch person and validate token
  const { data: person, error: fetchErr } = await db
    .from('people')
    .select('id, first_name, last_name, church_size, lifecycle_stage, masterclass_access_token')
    .eq('id', id)
    .single();

  if (fetchErr || !person) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Person not found' }) };
  }

  // Validate access token
  if (!person.masterclass_access_token || !safeCompare(token, person.masterclass_access_token)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
  }

  // Check lifecycle stage
  const validStages = ['masterclass_unlocked', 'masterclass_complete', 'roundtable_member'];
  if (!validStages.includes(person.lifecycle_stage)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Masterclass not yet unlocked' }) };
  }

  // Fetch progress records
  const { data: progress } = await db
    .from('masterclass_progress')
    .select('video_number, started_at, completed_at, assignment_submitted, unlocked_at')
    .eq('person_id', id)
    .order('video_number');

  const progressMap = {};
  (progress || []).forEach(function(p) {
    progressMap[p.video_number] = p;
  });

  // Determine church size eligibility for Video 5
  const isLargeChurch = ['100–300', '300–800', '800+'].includes(person.church_size);
  const now = new Date();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Build video status list
  const videos = [];

  for (const video of VIDEOS) {
    // Skip Video 5 for under-100 churches
    if (video.number === 5 && !isLargeChurch) continue;

    const prog = progressMap[video.number];
    let status = 'locked';
    let available_date = null;

    if (video.number === 1) {
      // Video 1 always available
      status = getVideoStatus(prog);
    } else if (video.number === 5) {
      // Video 5: only after Video 4 assignment submitted
      const v4 = progressMap[4];
      if (v4 && v4.assignment_submitted) {
        status = getVideoStatus(prog);
      }
    } else {
      // Videos 2-4: unlock 7 days after previous video started
      const prevProg = progressMap[video.number - 1];
      if (prevProg && prevProg.started_at) {
        const unlockDate = new Date(new Date(prevProg.started_at).getTime() + SEVEN_DAYS_MS);
        if (now >= unlockDate) {
          status = getVideoStatus(prog);
        } else {
          available_date = unlockDate.toISOString();
        }
      }
    }

    videos.push({
      number: video.number,
      title: video.title,
      status: status,
      available_date: available_date,
      started: prog?.started_at || null,
      completed: prog?.completed_at || null,
      assignment_submitted: prog?.assignment_submitted || false
    });
  }

  // Determine if masterclass is complete
  const allComplete = person.lifecycle_stage === 'masterclass_complete';

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      person: {
        first_name: person.first_name,
        last_name: person.last_name,
        church_size: person.church_size,
        lifecycle_stage: person.lifecycle_stage
      },
      videos: videos,
      is_large_church: isLargeChurch,
      masterclass_complete: allComplete
    })
  };
};

function getVideoStatus(prog) {
  if (!prog || !prog.started_at) return 'available';
  if (prog.assignment_submitted) return 'completed';
  return 'in_progress';
}
