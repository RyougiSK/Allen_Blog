CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Subscribers table for email newsletter
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  preferred_locale TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_locale IN ('en', 'zh')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'unsubscribed')),
  token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscribers_status ON subscribers (status);
CREATE INDEX idx_subscribers_token ON subscribers (token);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read"
  ON subscribers FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Token-based update"
  ON subscribers FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete"
  ON subscribers FOR DELETE USING (auth.role() = 'authenticated');

-- Notification log to prevent duplicate email sends
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed', 'partial'))
);

CREATE UNIQUE INDEX idx_notification_log_article
  ON notification_log (article_id);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage notification_log"
  ON notification_log FOR ALL USING (auth.role() = 'authenticated');
