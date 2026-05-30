-- TinySteps — Run in Supabase Dashboard → SQL Editor → Run

CREATE TABLE IF NOT EXISTS child_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age_group   TEXT NOT NULL CHECK (age_group IN ('2-4','5-7','8-10')),
  avatar_id   TEXT NOT NULL DEFAULT 'owl',
  language    TEXT NOT NULL DEFAULT 'en',
  theme_color TEXT NOT NULL DEFAULT '#FF6B6B',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language              TEXT DEFAULT 'en',
  theme                 TEXT DEFAULT 'system',
  sound_enabled         BOOLEAN DEFAULT TRUE,
  music_enabled         BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS child_stars (
  child_id    UUID PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  total_stars INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier       TEXT NOT NULL DEFAULT 'free',
  is_active  BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_stars     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_children"     ON child_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "parent_settings"     ON settings        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "parent_stars"        ON child_stars     FOR ALL USING (child_id IN (SELECT id FROM child_profiles WHERE user_id = auth.uid()));
CREATE POLICY "parent_subscription" ON subscriptions   FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO subscriptions (user_id, tier) VALUES (NEW.id, 'free') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
