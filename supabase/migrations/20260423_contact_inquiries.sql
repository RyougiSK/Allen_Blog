CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL
    CHECK (inquiry_type IN ('interview', 'collaboration', 'speaking', 'other')),
  message TEXT NOT NULL,
  referral_source TEXT,
  locale TEXT NOT NULL DEFAULT 'en'
    CHECK (locale IN ('en', 'zh')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_inquiries_status ON contact_inquiries (status);
CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries (created_at DESC);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries"
  ON contact_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read inquiries"
  ON contact_inquiries FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inquiries"
  ON contact_inquiries FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete inquiries"
  ON contact_inquiries FOR DELETE USING (auth.role() = 'authenticated');
