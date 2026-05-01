-- Article version history for undo/restore capability
CREATE TABLE IF NOT EXISTS article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  en JSONB NOT NULL,
  zh JSONB NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('auto_save', 'manual', 'publish')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_article_versions_article_id ON article_versions(article_id, created_at DESC);
