-- Requires pg_cron extension enabled in Supabase Dashboard → Database → Extensions
-- Also requires pg_net extension for the HTTP call to the Edge Function

-- Drip processor: fires every 5 minutes, calls process-drip Edge Function
SELECT cron.schedule(
  'process-email-drip',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/process-drip',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret', true),
        'Content-Type', 'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- Cleanup stale rate-limit buckets older than 2 hours
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *',
  $$
    DELETE FROM rate_limit_counter WHERE updated_at < NOW() - INTERVAL '2 hours';
  $$
);

-- NOTE: Set these app settings in Supabase Dashboard → Database → Settings:
--   app.supabase_url = https://[your-project-ref].supabase.co
--   app.cron_secret  = [same value as CRON_SECRET env var]
