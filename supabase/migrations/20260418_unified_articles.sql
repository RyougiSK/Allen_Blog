-- Unified articles table: one row = one idea, two language expressions
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  en JSONB NOT NULL DEFAULT '{}'::jsonb,
  zh JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Junction table for article <-> tag relationships
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Unique slug indexes per language (partial, only when slug is non-empty)
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_en_slug
  ON articles ((en->>'slug'))
  WHERE en->>'slug' IS NOT NULL AND en->>'slug' != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_zh_slug
  ON articles ((zh->>'slug'))
  WHERE zh->>'slug' IS NOT NULL AND zh->>'slug' != '';

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles (created_at DESC);

-- Migrate data from posts -> articles
DO $$
DECLARE
  en_post RECORD;
  zh_post RECORD;
  new_article_id UUID;
  standalone_zh RECORD;
BEGIN
  -- 1. Migrate EN posts (originals) with their ZH translations
  FOR en_post IN
    SELECT p.*, array_agg(pt.tag_id) FILTER (WHERE pt.tag_id IS NOT NULL) AS tag_ids
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    WHERE p.locale = 'en'
    GROUP BY p.id
  LOOP
    -- Look for a ZH translation of this EN post
    SELECT * INTO zh_post
    FROM posts
    WHERE translation_of = en_post.id AND locale = 'zh-cn'
    LIMIT 1;

    INSERT INTO articles (
      id, status, cover_image, author_id, created_at, updated_at, en, zh
    ) VALUES (
      gen_random_uuid(),
      CASE WHEN en_post.published THEN 'published' ELSE 'draft' END,
      NULL,
      en_post.author_id,
      en_post.created_at,
      GREATEST(en_post.updated_at, COALESCE(zh_post.updated_at, en_post.updated_at)),
      jsonb_build_object(
        'title', COALESCE(en_post.title, ''),
        'subtitle', '',
        'slug', COALESCE(en_post.slug, ''),
        'content', COALESCE(en_post.content, ''),
        'excerpt', COALESCE(en_post.excerpt, ''),
        'completed', (en_post.title IS NOT NULL AND en_post.title != '' AND en_post.content IS NOT NULL AND en_post.content != ''),
        'meta', jsonb_build_object('meta_title', '', 'meta_description', '', 'keywords', '[]'::jsonb)
      ),
      CASE WHEN zh_post.id IS NOT NULL THEN
        jsonb_build_object(
          'title', COALESCE(zh_post.title, ''),
          'subtitle', '',
          'slug', COALESCE(zh_post.slug, ''),
          'content', COALESCE(zh_post.content, ''),
          'excerpt', COALESCE(zh_post.excerpt, ''),
          'completed', (zh_post.title IS NOT NULL AND zh_post.title != '' AND zh_post.content IS NOT NULL AND zh_post.content != ''),
          'meta', jsonb_build_object('meta_title', '', 'meta_description', '', 'keywords', '[]'::jsonb)
        )
      ELSE
        '{}'::jsonb
      END
    )
    RETURNING id INTO new_article_id;

    -- Migrate tags from EN post
    IF en_post.tag_ids IS NOT NULL THEN
      INSERT INTO article_tags (article_id, tag_id)
      SELECT new_article_id, unnest(en_post.tag_ids)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Also migrate tags from ZH post if any
    IF zh_post.id IS NOT NULL THEN
      INSERT INTO article_tags (article_id, tag_id)
      SELECT new_article_id, pt.tag_id
      FROM post_tags pt
      WHERE pt.post_id = zh_post.id
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- 2. Migrate standalone ZH posts (no translation_of, and not referenced by any EN post)
  FOR standalone_zh IN
    SELECT p.*, array_agg(pt.tag_id) FILTER (WHERE pt.tag_id IS NOT NULL) AS tag_ids
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    WHERE p.locale = 'zh-cn'
      AND p.translation_of IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM posts en WHERE en.locale = 'en'
          AND EXISTS (SELECT 1 FROM posts zh WHERE zh.translation_of = en.id AND zh.id = p.id)
      )
    GROUP BY p.id
  LOOP
    INSERT INTO articles (
      id, status, cover_image, author_id, created_at, updated_at, en, zh
    ) VALUES (
      gen_random_uuid(),
      CASE WHEN standalone_zh.published THEN 'published' ELSE 'draft' END,
      NULL,
      standalone_zh.author_id,
      standalone_zh.created_at,
      standalone_zh.updated_at,
      '{}'::jsonb,
      jsonb_build_object(
        'title', COALESCE(standalone_zh.title, ''),
        'subtitle', '',
        'slug', COALESCE(standalone_zh.slug, ''),
        'content', COALESCE(standalone_zh.content, ''),
        'excerpt', COALESCE(standalone_zh.excerpt, ''),
        'completed', (standalone_zh.title IS NOT NULL AND standalone_zh.title != '' AND standalone_zh.content IS NOT NULL AND standalone_zh.content != ''),
        'meta', jsonb_build_object('meta_title', '', 'meta_description', '', 'keywords', '[]'::jsonb)
      )
    )
    RETURNING id INTO new_article_id;

    IF standalone_zh.tag_ids IS NOT NULL THEN
      INSERT INTO article_tags (article_id, tag_id)
      SELECT new_article_id, unnest(standalone_zh.tag_ids)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END
$$;

-- Rename old tables as backup
ALTER TABLE IF EXISTS post_tags RENAME TO _post_tags_backup;
ALTER TABLE IF EXISTS posts RENAME TO _posts_backup;
