-- Enable pg_cron for auto-cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','basic','pro')),
  status TEXT DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  font TEXT DEFAULT 'Segoe UI',
  font_size INTEGER DEFAULT 14,
  opacity INTEGER DEFAULT 100,
  layout TEXT DEFAULT 'single',
  ai_provider TEXT DEFAULT 'claude',
  ai_model TEXT DEFAULT 'claude-haiku-4-5-20251001',
  custom_api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  encrypted_content TEXT NOT NULL DEFAULT '',
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  password_hash TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  size_bytes INTEGER DEFAULT 0,
  format TEXT DEFAULT 'plain',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage table
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  ai_calls_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users
  FOR ALL USING (clerk_id = current_setting('app.clerk_id'));

CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR ALL USING (user_id = (
    SELECT id FROM users
    WHERE clerk_id = current_setting('app.clerk_id')
  ));

CREATE POLICY "Users can manage own settings" ON settings
  FOR ALL USING (user_id = (
    SELECT id FROM users
    WHERE clerk_id = current_setting('app.clerk_id')
  ));

CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (
    user_id = (
      SELECT id FROM users
      WHERE clerk_id = current_setting('app.clerk_id')
    ) OR is_shared = TRUE
  );

CREATE POLICY "Shared notes readable by anyone" ON notes
  FOR SELECT USING (is_shared = TRUE);

-- Auto-delete expired notes (runs every hour)
SELECT cron.schedule(
  'delete-expired-notes',
  '0 * * * *',
  $$ DELETE FROM notes WHERE expires_at IS NOT NULL AND expires_at < NOW() $$
);

-- Helper function for AI usage increment (upsert pattern)
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID, p_date DATE)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO usage (user_id, date, ai_calls_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET ai_calls_count = usage.ai_calls_count + 1;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_notes_share_token ON notes(share_token);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_expires_at ON notes(expires_at);
CREATE INDEX idx_usage_user_date ON usage(user_id, date);
