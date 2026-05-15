import { NextRequest } from "next/server";
import { EVIDENCE_REVIEW_PROMPT } from "@/lib/ai/film-psyche-prompts";
import { handleFilmPsycheReview } from "../shared";

export async function POST(request: NextRequest) {
  return handleFilmPsycheReview(request, EVIDENCE_REVIEW_PROMPT, "evidence");
}
