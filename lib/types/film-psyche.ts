export type FilmWorkType = "movie" | "series" | "novel" | "anime" | "game";
export type ProjectStatus =
  | "draft"
  | "evidence_complete"
  | "ai_reviewed"
  | "blog_drafted";
export type ReviewType =
  | "evidence"
  | "archetype"
  | "function_attitude"
  | "blog_outline"
  | "blog_draft"
  | "learning_feedback";

export interface FilmProject {
  id: string;
  title: string;
  original_title: string;
  work_type: FilmWorkType;
  year: number | null;
  director_or_author: string;
  analysis_goal: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface StoryStructure {
  id: string;
  project_id: string;
  opening_state: string;
  protagonist_surface_desire: string;
  protagonist_deep_lack: string;
  protagonist_fear: string;
  protagonist_escape: string;
  protagonist_called_by: string;
  protagonist_loss: string;
  protagonist_integration: string;
  protagonist_transformation: string;
  call_to_adventure: string;
  point_of_no_return: string;
  final_achievement: string;
  ending_change: string;
}

export interface FilmCharacter {
  id: string;
  project_id: string;
  name: string;
  role_in_story: string;
  relationship_to_protagonist: string;
  repeated_actions: string;
  repeated_lines: string;
  decision_style: string;
  stress_response: string;
  relationship_style: string;
  psychological_force: string;
  archetype_guess: string;
  function_attitude_guess: string;
  evidence: string;
  uncertainty: string;
  sort_order: number;
}

export interface FilmScene {
  id: string;
  project_id: string;
  scene_name: string;
  time_marker: string;
  scene_summary: string;
  characters_involved: string;
  key_lines: string;
  key_actions: string;
  protagonist_desire: string;
  protagonist_fear: string;
  what_changed: string;
  archetypal_meaning: string;
  function_attitude_evidence: string;
  user_interpretation: string;
  is_key_scene: boolean;
  sort_order: number;
}

export interface AiReview {
  id: string;
  project_id: string;
  review_type: ReviewType;
  content: string;
  evidence_score: Record<string, number> | null;
  created_at: string;
}

export interface FilmProjectWithCounts extends FilmProject {
  character_count: number;
  scene_count: number;
  has_story: boolean;
  review_count: number;
}

export interface ProjectSetupData {
  title: string;
  original_title: string;
  work_type: FilmWorkType;
  year: number | null;
  director_or_author: string;
  analysis_goal: string;
}

export interface StoryStructureData
  extends Omit<StoryStructure, "id" | "project_id"> {}

export interface CharacterData
  extends Omit<FilmCharacter, "id" | "project_id"> {}

export interface SceneData extends Omit<FilmScene, "id" | "project_id"> {}

// --- Constants ---

export const WORK_TYPE_OPTIONS: { value: FilmWorkType; label: string }[] = [
  { value: "movie", label: "电影" },
  { value: "series", label: "剧集" },
  { value: "novel", label: "小说" },
  { value: "anime", label: "动画" },
  { value: "game", label: "游戏" },
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "草稿",
  evidence_complete: "证据完成",
  ai_reviewed: "AI 已审",
  blog_drafted: "博客已写",
};

export const STATUS_BADGE_VARIANT: Record<
  ProjectStatus,
  "default" | "success" | "warning"
> = {
  draft: "default",
  evidence_complete: "warning",
  ai_reviewed: "success",
  blog_drafted: "success",
};

export const ARCHETYPE_OPTIONS = [
  { value: "ego_hero", label: "Ego / Hero" },
  { value: "parent_mentor", label: "Parent / Mentor" },
  { value: "child", label: "Child" },
  { value: "inferior", label: "Inferior" },
  { value: "shadow", label: "Shadow" },
  { value: "anima_animus", label: "Anima / Animus" },
  { value: "wise_old", label: "Wise Old Man / Woman" },
  { value: "trickster", label: "Trickster" },
  { value: "senex_witch", label: "Senex / Witch" },
  { value: "demon", label: "Demon" },
  { value: "self", label: "Self" },
  { value: "threshold_guardian", label: "Threshold Guardian" },
  { value: "messenger", label: "Messenger" },
  { value: "companion", label: "Companion" },
] as const;

export const FA_OPTIONS = [
  { value: "Se", label: "Se — 外倾感觉" },
  { value: "Si", label: "Si — 内倾感觉" },
  { value: "Ne", label: "Ne — 外倾直觉" },
  { value: "Ni", label: "Ni — 内倾直觉" },
  { value: "Te", label: "Te — 外倾思维" },
  { value: "Ti", label: "Ti — 内倾思维" },
  { value: "Fe", label: "Fe — 外倾情感" },
  { value: "Fi", label: "Fi — 内倾情感" },
] as const;

export const SCENE_TYPE_SUGGESTIONS = [
  "主角第一次出场",
  "召唤出现",
  "主角拒绝或犹豫",
  "导师出现",
  "旧世界破裂",
  "第一次真正选择",
  "导师死亡 / 支撑消失",
  "最终考验",
  "结局转化",
] as const;
