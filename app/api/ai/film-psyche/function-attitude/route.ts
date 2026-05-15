import { NextRequest } from "next/server";
import { FUNCTION_ATTITUDE_REVIEW_PROMPT } from "@/lib/ai/film-psyche-prompts";
import { handleFilmPsycheReview } from "../shared";

export async function POST(request: NextRequest) {
  return handleFilmPsycheReview(
    request,
    FUNCTION_ATTITUDE_REVIEW_PROMPT,
    "function_attitude"
  );
}
