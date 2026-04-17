-- Add locale support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en'
  CHECK (locale IN ('en', 'zh-cn'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS translation_of UUID REFERENCES posts(id) ON DELETE SET NULL;

-- Unique constraint: one slug per locale
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_slug_locale_unique') THEN
    ALTER TABLE posts ADD CONSTRAINT posts_slug_locale_unique UNIQUE (slug, locale);
  END IF;
END
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_locale ON posts(locale);
CREATE INDEX IF NOT EXISTS idx_posts_translation_of ON posts(translation_of);
