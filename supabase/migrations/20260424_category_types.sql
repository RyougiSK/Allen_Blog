-- Add type column to categories: 'blog' for the built-in Blog section, 'column' for admin-managed columns
ALTER TABLE categories
  ADD COLUMN type TEXT NOT NULL DEFAULT 'column'
  CHECK (type IN ('blog', 'column'));

CREATE INDEX idx_categories_type ON categories(type);

-- Seed the Blog category
INSERT INTO categories (name, name_zh, slug, description, display_order, type)
VALUES ('Blog', '博文', 'blog', 'Everyday musings, life reflections, and notes.', 0, 'blog')
ON CONFLICT (slug) DO UPDATE SET type = 'blog', name = 'Blog', name_zh = '博文';

-- Default all uncategorized articles to Blog
UPDATE articles
SET category_id = (SELECT id FROM categories WHERE slug = 'blog')
WHERE category_id IS NULL;
