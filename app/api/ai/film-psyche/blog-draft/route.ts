import { NextRequest } from "next/server";
import { BLOG_DRAFT_PROMPT } from "@/lib/ai/film-psyche-prompts";
import { handleFilmPsycheReview } from "../shared";

export async function POST(request: NextRequest) {
  return handleFilmPsycheReview(request, BLOG_DRAFT_PROMPT, "blog_draft");
}
