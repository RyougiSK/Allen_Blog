-- Film Psyche Analysis Trainer
-- Replaces the old narrative analysis module

-- Drop old tables
DROP TABLE IF EXISTS analysis_characters CASCADE;
DROP TABLE IF EXISTS analysis_entries CASCADE;

-- 1. Film Analysis Projects
CREATE TABLE film_analysis_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  original_title TEXT NOT NULL DEFAULT '',
  work_type TEXT NOT NULL DEFAULT 'movie'
    CHECK (work_type IN ('movie', 'series', 'novel', 'anime', 'game')),
  year INTEGER,
  director_or_author TEXT NOT NULL DEFAULT '',
  analysis_goal TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'evidence_complete', 'ai_reviewed', 'blog_drafted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Story Structure (1:1 with project)
CREATE TABLE story_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES film_analysis_projects(id) ON DELETE CASCADE,
  opening_state TEXT NOT NULL DEFAULT '',
  protagonist_surface_desire TEXT NOT NULL DEFAULT '',
  protagonist_deep_lack TEXT NOT NULL DEFAULT '',
  protagonist_fear TEXT NOT NULL DEFAULT '',
  protagonist_escape TEXT NOT NULL DEFAULT '',
  protagonist_called_by TEXT NOT NULL DEFAULT '',
  protagonist_loss TEXT NOT NULL DEFAULT '',
  protagonist_integration TEXT NOT NULL DEFAULT '',
  protagonist_transformation TEXT NOT NULL DEFAULT '',
  call_to_adventure TEXT NOT NULL DEFAULT '',
  point_of_no_return TEXT NOT NULL DEFAULT '',
  final_achievement TEXT NOT NULL DEFAULT '',
  ending_change TEXT NOT NULL DEFAULT ''
);

-- 3. Characters (1:many)
CREATE TABLE film_psyche_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES film_analysis_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role_in_story TEXT NOT NULL DEFAULT '',
  relationship_to_protagonist TEXT NOT NULL DEFAULT '',
  repeated_actions TEXT NOT NULL DEFAULT '',
  repeated_lines TEXT NOT NULL DEFAULT '',
  decision_style TEXT NOT NULL DEFAULT '',
  stress_response TEXT NOT NULL DEFAULT '',
  relationship_style TEXT NOT NULL DEFAULT '',
  psychological_force TEXT NOT NULL DEFAULT '',
  archetype_guess TEXT NOT NULL DEFAULT '',
  function_attitude_guess TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  uncertainty TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 4. Scenes (1:many)
CREATE TABLE film_psyche_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES film_analysis_projects(id) ON DELETE CASCADE,
  scene_name TEXT NOT NULL DEFAULT '',
  time_marker TEXT NOT NULL DEFAULT '',
  scene_summary TEXT NOT NULL DEFAULT '',
  characters_involved TEXT NOT NULL DEFAULT '',
  key_lines TEXT NOT NULL DEFAULT '',
  key_actions TEXT NOT NULL DEFAULT '',
  protagonist_desire TEXT NOT NULL DEFAULT '',
  protagonist_fear TEXT NOT NULL DEFAULT '',
  what_changed TEXT NOT NULL DEFAULT '',
  archetypal_meaning TEXT NOT NULL DEFAULT '',
  function_attitude_evidence TEXT NOT NULL DEFAULT '',
  user_interpretation TEXT NOT NULL DEFAULT '',
  is_key_scene BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. AI Reviews (1:many)
CREATE TABLE film_psyche_ai_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES film_analysis_projects(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL
    CHECK (review_type IN ('evidence', 'archetype', 'function_attitude', 'blog_outline', 'blog_draft', 'learning_feedback')),
  content TEXT NOT NULL DEFAULT '',
  evidence_score JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_film_projects_status ON film_analysis_projects(status);
CREATE INDEX idx_film_projects_updated ON film_analysis_projects(updated_at DESC);
CREATE INDEX idx_film_characters_project ON film_psyche_characters(project_id, sort_order);
CREATE INDEX idx_film_scenes_project ON film_psyche_scenes(project_id, sort_order);
CREATE INDEX idx_film_reviews_project ON film_psyche_ai_reviews(project_id, created_at DESC);

-- RLS
ALTER TABLE film_analysis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_psyche_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_psyche_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_psyche_ai_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage film_analysis_projects"
  ON film_analysis_projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage story_structure"
  ON story_structure FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage film_psyche_characters"
  ON film_psyche_characters FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage film_psyche_scenes"
  ON film_psyche_scenes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage film_psyche_ai_reviews"
  ON film_psyche_ai_reviews FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
