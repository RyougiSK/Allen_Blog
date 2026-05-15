import { NextRequest } from "next/server";
import { ARCHETYPE_REVIEW_PROMPT } from "@/lib/ai/film-psyche-prompts";
import { handleFilmPsycheReview } from "../shared";

export async function POST(request: NextRequest) {
  return handleFilmPsycheReview(request, ARCHETYPE_REVIEW_PROMPT, "archetype");
}
