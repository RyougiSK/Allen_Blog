-- Narrative analysis entries for structured Jungian/Beebe framework writing
CREATE TABLE analysis_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  work_name TEXT NOT NULL DEFAULT '',
  work_type TEXT NOT NULL DEFAULT 'movie' CHECK (work_type IN ('movie', 'series', 'book', 'anime')),
  author_director TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '',
  thesis TEXT NOT NULL DEFAULT '',
  conflict_internal TEXT NOT NULL DEFAULT '',
  conflict_external TEXT NOT NULL DEFAULT '',
  shadow TEXT NOT NULL DEFAULT '',
  projection TEXT NOT NULL DEFAULT '',
  development_start TEXT NOT NULL DEFAULT '',
  development_crisis TEXT NOT NULL DEFAULT '',
  development_end TEXT NOT NULL DEFAULT '',
  reflection_scenario TEXT NOT NULL DEFAULT '',
  reflection_insight TEXT NOT NULL DEFAULT '',
  closing TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analysis_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analysis_entries(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL DEFAULT '',
  archetype TEXT NOT NULL DEFAULT 'Hero' CHECK (archetype IN ('Hero', 'Parent', 'Child', 'Inferior', 'Opposing', 'Senex', 'Trickster', 'Demon')),
  mbti_function TEXT DEFAULT '' CHECK (mbti_function IN ('', 'Ne', 'Ni', 'Fe', 'Fi', 'Te', 'Ti', 'Se', 'Si')),
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_analysis_entries_created ON analysis_entries(created_at DESC);
CREATE INDEX idx_analysis_characters_analysis ON analysis_characters(analysis_id, sort_order);

ALTER TABLE analysis_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage analysis_entries"
  ON analysis_entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage analysis_characters"
  ON analysis_characters FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
