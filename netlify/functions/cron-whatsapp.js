const { getSupabase } = require('./lib/supabase');
const { sendWhatsApp, alreadySent } = require('./lib/whatsapp');

/**
 * Scheduled function — runs daily at 2AM UTC (9AM WIB Jakarta time).
 * Handles all time-based WhatsApp triggers:
 * 1. Day 7 profile nudge for book_buyer lifecycle
 * 2. Day 14 profile nudge for book_buyer lifecycle
 * 3. Video unlock notifications for masterclass users
 * 4. Monthly check-ins for under-100 pastors
 */
exports.handler = async (event) => {
  // Scheduled functions receive a special event
  console.log('WhatsApp cron started:', new Date().toISOString());

  const db = getSupabase();
  const now = new Date();
  const siteUrl = process.env.SITE_URL || 'https://multiply-or-die.com';

  let totalSent = 0;

  // === JOB 1: Day 7 Profile Nudge ===
  try {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: day7People } = await db
      .from('people')
      .select('id, mobile_phone, first_name')
      .eq('lifecycle_stage', 'book_buyer')
      .lte('created_at', sevenDaysAgo)
      .not('mobile_phone', 'is', null);

    if (day7People) {
      for (const person of day7People) {
        if (await alreadySent(person.id, 'day_7_profile_nudge')) continue;

        const link = `${siteUrl}/profile?id=${person.id}`;
        await sendWhatsApp(
          person.id,
          person.mobile_phone,
          'day_7_profile_nudge',
          `Sudah mulai membaca? Lengkapi profil kepemimpinan Anda untuk membuka akses ke masterclass video gratis. ${link}`
        );
        totalSent++;
      }
    }
  } catch (err) {
    console.error('Day 7 nudge error:', err.message);
  }

  // === JOB 2: Day 14 Profile Nudge ===
  try {
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: day14People } = await db
      .from('people')
      .select('id, mobile_phone, first_name')
      .eq('lifecycle_stage', 'book_buyer')
      .lte('created_at', fourteenDaysAgo)
      .not('mobile_phone', 'is', null);

    if (day14People) {
      for (const person of day14People) {
        if (await alreadySent(person.id, 'day_14_profile_nudge')) continue;

        const link = `${siteUrl}/profile?id=${person.id}`;
        await sendWhatsApp(
          person.id,
          person.mobile_phone,
          'day_14_profile_nudge',
          `Masterclass Anda menunggu. 4 video yang akan mengubah cara Anda memimpin. Selesaikan profil Anda. ${link}`
        );
        totalSent++;
      }
    }
  } catch (err) {
    console.error('Day 14 nudge error:', err.message);
  }

  // === JOB 3: Video Unlock Notifications ===
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Get all people in masterclass who have started at least one video
    const { data: masterclassPeople } = await db
      .from('people')
      .select('id, mobile_phone, masterclass_access_token')
      .eq('lifecycle_stage', 'masterclass_unlocked')
      .not('mobile_phone', 'is', null);

    if (masterclassPeople) {
      for (const person of masterclassPeople) {
        // Get their progress
        const { data: progress } = await db
          .from('masterclass_progress')
          .select('video_number, started_at')
          .eq('person_id', person.id)
          .order('video_number');

        if (!progress || progress.length === 0) continue;

        const progressMap = {};
        progress.forEach(function(p) { progressMap[p.video_number] = p; });

        // Check videos 2-4 for unlock notifications
        for (let v = 2; v <= 4; v++) {
          const prevProg = progressMap[v - 1];
          const currentProg = progressMap[v];

          // If previous video started AND 7 days have passed AND current not started AND not already notified
          if (prevProg && prevProg.started_at && !currentProg) {
            const unlockDate = new Date(new Date(prevProg.started_at).getTime() + SEVEN_DAYS_MS);
            if (now >= unlockDate) {
              const messageType = 'video_' + v + '_unlock';
              if (await alreadySent(person.id, messageType)) continue;

              const link = `${siteUrl}/masterclass?id=${person.id}&token=${person.masterclass_access_token}`;
              var messages = {
                2: 'Video 2 telah dibuka! Lanjutkan perjalanan Anda: ',
                3: 'Video 3 menunggu Anda: ',
                4: 'Video terakhir Anda siap: '
              };
              await sendWhatsApp(
                person.id,
                person.mobile_phone,
                messageType,
                messages[v] + link
              );
              totalSent++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Video unlock notification error:', err.message);
  }

  // === JOB 4: Monthly Check-ins for Under-100 Pastors ===
  try {
    const { data: under100People } = await db
      .from('people')
      .select('id, mobile_phone, first_name')
      .eq('lifecycle_stage', 'masterclass_complete')
      .in('church_size', ['Under 50', '50–100'])
      .not('mobile_phone', 'is', null);

    if (under100People) {
      const monthlyMessages = [
        { type: 'monthly_checkin_1', body: 'Bagaimana Audit Penambahan Anda? Hambatan apa yang telah Anda identifikasi?' },
        { type: 'monthly_checkin_2', body: 'Sudahkah Anda menilai pemimpin Anda dengan H.E.A.T.? Siapa yang mendapat skor tertinggi?' },
        { type: 'monthly_checkin_3', body: 'Di mana posisi pemimpin Anda di peta 4D?' },
        { type: 'monthly_checkin_4', body: 'Sudahkah Anda memulai arsitektur Dua Belas Suku?' }
      ];

      for (const person of under100People) {
        // Find which monthly message is next (hasn't been sent yet)
        for (const msg of monthlyMessages) {
          if (await alreadySent(person.id, msg.type)) continue;

          // Check if enough time has passed (30 days between each)
          const prevType = monthlyMessages[monthlyMessages.indexOf(msg) - 1];
          if (prevType) {
            const { data: prevLog } = await db
              .from('whatsapp_log')
              .select('sent_at')
              .eq('person_id', person.id)
              .eq('message_type', prevType.type)
              .single();

            if (prevLog) {
              const daysSince = (now - new Date(prevLog.sent_at)) / (1000 * 60 * 60 * 24);
              if (daysSince < 30) break; // Not time yet
            } else {
              break; // Previous message not sent yet
            }
          } else {
            // First message — check if masterclass was completed at least 30 days ago
            const { data: personData } = await db
              .from('people')
              .select('updated_at')
              .eq('id', person.id)
              .single();

            if (personData) {
              const daysSinceComplete = (now - new Date(personData.updated_at)) / (1000 * 60 * 60 * 24);
              if (daysSinceComplete < 30) break;
            }
          }

          await sendWhatsApp(person.id, person.mobile_phone, msg.type, msg.body);
          totalSent++;
          break; // Only send one per person per day
        }
      }
    }
  } catch (err) {
    console.error('Monthly check-in error:', err.message);
  }

  console.log(`WhatsApp cron completed. Messages sent: ${totalSent}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, messages_sent: totalSent })
  };
};
