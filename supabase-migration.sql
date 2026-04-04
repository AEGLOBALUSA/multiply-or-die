-- Multiply or Die - Supabase Migration
-- Run this against project: qpvghoqrfbpfjywyteeg (Indonesian National Conference)

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  mobile_phone text,
  person_origin text DEFAULT 'invested',
  preferred_language text DEFAULT 'id',
  hub_region text DEFAULT 'Southeast Asia',
  lifecycle_stage text DEFAULT 'book_buyer',
  church_name text,
  city text,
  church_size text,
  years_in_ministry text,
  leadership_role text,
  biggest_challenge text,
  team_size text,
  training_preference text,
  roundtable_eligible boolean DEFAULT false,
  profile_fields_completed integer DEFAULT 0,
  masterclass_access_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS redemption_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  person_id uuid REFERENCES people(id),
  generated_at timestamptz DEFAULT now(),
  redeemed boolean DEFAULT false,
  redeemed_at timestamptz
);

CREATE TABLE IF NOT EXISTS masterclass_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id),
  video_number integer NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  assignment_submitted boolean DEFAULT false,
  assignment_text text,
  unlocked_at timestamptz
);

CREATE TABLE IF NOT EXISTS whatsapp_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id),
  message_type text,
  sent_at timestamptz DEFAULT now(),
  twilio_message_sid text
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_redemption_codes_code ON redemption_codes(code);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_person ON redemption_codes(person_id);
CREATE INDEX IF NOT EXISTS idx_masterclass_progress_person ON masterclass_progress(person_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_person_type ON whatsapp_log(person_id, message_type);
CREATE INDEX IF NOT EXISTS idx_people_lifecycle ON people(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
