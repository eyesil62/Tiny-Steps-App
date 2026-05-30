-- ============================================================
-- TinySteps — Full Schema Reset (run this in Supabase SQL Editor)
-- This safely drops and recreates everything cleanly
-- ============================================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "parent_children"     ON child_profiles;
DROP POLICY IF EXISTS "parent_settings"     ON settings;
DROP POLICY IF EXISTS "parent_stars"        ON child_stars;
DROP POLICY IF EXISTS "parent_subscription" ON subscriptions;

-- Step 2: Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 3: Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS child_stars    CASCADE;
DROP TABLE IF EXISTS subscriptions  CASCADE;
DROP TABLE IF EXISTS settings       CASCADE;
DROP TABLE IF EXISTS child_profiles CASCADE;

-- Step 4: Recreate tables fresh

CREATE TABLE child_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age_group   TEXT NOT NULL CHECK (age_group IN ('2-4','5-7','8-10')),
  avatar_id   TEXT NOT NULL DEFAULT 'owl',
  language    TEXT NOT NULL DEFAULT 'en',
  theme_color TEXT NOT NULL DEFAULT '#FF6B6B',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language              TEXT DEFAULT 'en',
  theme                 TEXT DEFAULT 'system',
  sound_enabled         BOOLEAN DEFAULT TRUE,
  music_enabled         BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE child_stars (
  child_id    UUID PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  total_stars INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier       TEXT NOT NULL DEFAULT 'free',
  is_active  BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Enable Row Level Security
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_stars     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies WITH CHECK (this was missing before — caused the error)
CREATE POLICY "parent_children" ON child_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "parent_settings" ON settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "parent_stars" ON child_stars
  FOR ALL
  USING (
    child_id IN (SELECT id FROM child_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM child_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "parent_subscription" ON subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 7: Auto-create settings + subscription on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.subscriptions (user_id, tier, is_active)
    VALUES (NEW.id, 'free', false)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 8: Indexes for performance
CREATE INDEX idx_child_profiles_user ON child_profiles(user_id);
CREATE INDEX idx_child_stars_child   ON child_stars(child_id);

-- Done!
SELECT 'TinySteps schema created successfully' AS status;
