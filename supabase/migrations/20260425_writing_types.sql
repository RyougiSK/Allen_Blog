-- Create dedicated writing_types table
CREATE TABLE writing_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_writing_types_slug ON writing_types(slug);

-- Seed from existing categories that had type='blog' or type='column'
INSERT INTO writing_types (name, name_zh, slug, description, is_default, display_order)
SELECT name, name_zh, slug, description, (type = 'blog'), display_order
FROM categories
WHERE type IN ('blog', 'column')
ORDER BY display_order;

-- Add writing_type_id to articles
ALTER TABLE articles
  ADD COLUMN writing_type_id UUID REFERENCES writing_types(id) ON DELETE SET NULL;

-- Populate writing_type_id from existing category_id mappings
UPDATE articles a
SET writing_type_id = wt.id
FROM categories c
JOIN writing_types wt ON wt.slug = c.slug
WHERE a.category_id = c.id AND c.type IN ('blog', 'column');

-- Clear category_id for articles whose category was a writing type
UPDATE articles a
SET category_id = NULL
FROM categories c
WHERE a.category_id = c.id AND c.type IN ('blog', 'column');

-- Remove the type-based categories since they are now in writing_types
DELETE FROM categories WHERE type IN ('blog', 'column');

-- Drop the type column from categories
ALTER TABLE categories DROP COLUMN type;
