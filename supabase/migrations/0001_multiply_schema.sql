-- Multiply or Die — Supabase schema
-- Run in order: 0001 first, then 0002 (after enabling pg_cron extension)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ══════════════════════════════════════════════════════════════
-- DONATIONS (append-only ledger)
-- Never UPDATE rows except receipt_sent_at, refunded_at, status.
-- stripe_payment_intent_id is the idempotency key.
-- ══════════════════════════════════════════════════════════════
CREATE TABLE donations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id  TEXT NOT NULL UNIQUE,
  stripe_charge_id          TEXT,
  customer_email            TEXT NOT NULL,
  customer_name             TEXT,
  shipping_option           TEXT NOT NULL CHECK (shipping_option IN ('standard','priority')),
  shipping_amount_cents     INT  NOT NULL CHECK (shipping_amount_cents >= 0),
  donation_amount_cents     INT  NOT NULL CHECK (donation_amount_cents >= 0),
  book_fmv_cents            INT  NOT NULL DEFAULT 2499,
  sponsored_pastors         INT  GENERATED ALWAYS AS (
    FLOOR(donation_amount_cents / 2000)
  ) STORED,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','succeeded','failed','refunded')),
  receipt_sent_at           TIMESTAMPTZ,
  refunded_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX donations_email_idx   ON donations (customer_email);
CREATE INDEX donations_status_idx  ON donations (status, created_at DESC);
CREATE INDEX donations_created_idx ON donations (created_at DESC);

-- ══════════════════════════════════════════════════════════════
-- SPONSORSHIP COUNTER (single-row cache)
-- The CHECK (id = 1) enforces exactly one row forever.
-- Updated atomically via trigger — never write directly.
-- ══════════════════════════════════════════════════════════════
CREATE TABLE sponsorship_counter (
  id                      INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_pastors_sponsored INT    NOT NULL DEFAULT 0,
  total_donated_cents     BIGINT NOT NULL DEFAULT 0,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sponsorship_counter (id, total_pastors_sponsored, total_donated_cents)
VALUES (1, 0, 0);

CREATE OR REPLACE FUNCTION update_sponsorship_counter()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- New succeeded donation
  IF (TG_OP = 'INSERT' AND NEW.status = 'succeeded') THEN
    UPDATE sponsorship_counter SET
      total_pastors_sponsored = total_pastors_sponsored + NEW.sponsored_pastors,
      total_donated_cents     = total_donated_cents + NEW.donation_amount_cents,
      updated_at              = NOW()
    WHERE id = 1;

  -- Status transition to succeeded (typical case: pending → succeeded)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'succeeded' AND NEW.status = 'succeeded') THEN
    UPDATE sponsorship_counter SET
      total_pastors_sponsored = total_pastors_sponsored + NEW.sponsored_pastors,
      total_donated_cents     = total_donated_cents + NEW.donation_amount_cents,
      updated_at              = NOW()
    WHERE id = 1;

  -- Refund — reverse the contribution
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'succeeded' AND NEW.status = 'refunded') THEN
    UPDATE sponsorship_counter SET
      total_pastors_sponsored = GREATEST(0, total_pastors_sponsored - OLD.sponsored_pastors),
      total_donated_cents     = GREATEST(0, total_donated_cents - OLD.donation_amount_cents),
      updated_at              = NOW()
    WHERE id = 1;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_sponsorship_counter
AFTER INSERT OR UPDATE OF status ON donations
FOR EACH ROW EXECUTE FUNCTION update_sponsorship_counter();

-- ══════════════════════════════════════════════════════════════
-- SUBSCRIBERS (CRM)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  first_name      TEXT,
  source_utm      JSONB,
  order_id        UUID REFERENCES donations(id) ON DELETE SET NULL,
  drip_step       INT  NOT NULL DEFAULT 0,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX subscribers_drip_idx ON subscribers (drip_step, unsubscribed_at)
  WHERE unsubscribed_at IS NULL;

-- ══════════════════════════════════════════════════════════════
-- EMAIL QUEUE (drip scheduling)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE email_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  template_key  TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at       TIMESTAMPTZ,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscriber_id, template_key)
);

CREATE INDEX email_queue_due_idx        ON email_queue (scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX email_queue_subscriber_idx ON email_queue (subscriber_id);

-- ══════════════════════════════════════════════════════════════
-- ANALYTICS EVENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE analytics_events (
  id           BIGSERIAL PRIMARY KEY,
  event_name   TEXT NOT NULL,
  properties   JSONB DEFAULT '{}',
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  ip_hash      TEXT,
  session_id   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX analytics_events_name_idx    ON analytics_events (event_name, created_at DESC);
CREATE INDEX analytics_events_created_idx ON analytics_events (created_at DESC);

-- ══════════════════════════════════════════════════════════════
-- RATE LIMIT COUNTER
-- ══════════════════════════════════════════════════════════════
CREATE TABLE rate_limit_counter (
  key        TEXT        NOT NULL,
  bucket     TIMESTAMPTZ NOT NULL,
  count      INT         NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, bucket)
);

-- RPC function used by lib/rate-limit.ts
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key    TEXT,
  p_bucket TIMESTAMPTZ,
  p_max    INT
) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO rate_limit_counter (key, bucket, count, updated_at)
  VALUES (p_key, p_bucket, 1, NOW())
  ON CONFLICT (key, bucket) DO UPDATE
    SET count = rate_limit_counter.count + 1,
        updated_at = NOW()
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
ALTER TABLE donations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_counter  ENABLE ROW LEVEL SECURITY;

-- Public can read the sponsorship counter (live display on page)
CREATE POLICY "anon_read_counter"
  ON sponsorship_counter FOR SELECT TO anon USING (true);

-- All other tables: service role only (bypasses RLS automatically)
