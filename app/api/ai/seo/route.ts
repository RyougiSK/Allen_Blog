import { NextRequest, NextResponse } from "next/server";
import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { createClient } from "@/utils/supabase/server";
import { getBedrockClient, getModelId } from "@/lib/ai/client";
import { SEO_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { stripThinkingBlocks } from "@/lib/ai/utils";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, excerpt, locale } = await request.json();

  if (!content && !title) {
    return NextResponse.json(
      { error: "Article content or title is required" },
      { status: 400 }
    );
  }

  const truncatedContent = content?.slice(0, 3000) || "";
  const userMessage = `Article language: ${locale === "zh" ? "Chinese" : "English"}
Title: ${title || "(none)"}
Excerpt: ${excerpt || "(none)"}
Content (first 3000 chars): ${truncatedContent}`;

  try {
    const client = getBedrockClient();
    const command = new ConverseCommand({
      modelId: getModelId(),
      system: [{ text: SEO_SYSTEM_PROMPT }],
      messages: [{ role: "user", content: [{ text: userMessage }] }],
      inferenceConfig: { maxTokens: 1024 },
    });

    const response = await client.send(command);
    const outputText =
      response.output?.message?.content?.[0]?.text || "";
    const cleaned = stripThinkingBlocks(outputText);

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const seoData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: seoData });
  } catch (error) {
    console.error("AI SEO generation failed:", error);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
