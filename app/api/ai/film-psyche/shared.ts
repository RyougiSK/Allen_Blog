import { NextRequest } from "next/server";
import { ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getBedrockClient, getModelId } from "@/lib/ai/client";
import { formatProjectContext } from "@/lib/ai/film-psyche-prompts";
import type { ReviewType } from "@/lib/types/film-psyche";

export async function handleFilmPsycheReview(
  request: NextRequest,
  systemPrompt: string,
  reviewType: ReviewType
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId } = await request.json();
  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  const [projectRes, storyRes, charsRes, scenesRes] = await Promise.all([
    supabase
      .from("film_analysis_projects")
      .select("*")
      .eq("id", projectId)
      .single(),
    supabase
      .from("story_structure")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("film_psyche_characters")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order"),
    supabase
      .from("film_psyche_scenes")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order"),
  ]);

  if (!projectRes.data) {
    return new Response("Project not found", { status: 404 });
  }

  const userMessage = formatProjectContext(
    projectRes.data,
    storyRes.data,
    charsRes.data ?? [],
    scenesRes.data ?? []
  );

  try {
    const client = getBedrockClient();
    const command = new ConverseStreamCommand({
      modelId: getModelId(),
      system: [{ text: systemPrompt }],
      messages: [{ role: "user", content: [{ text: userMessage }] }],
      inferenceConfig: { maxTokens: 8192 },
    });

    const response = await client.send(command);
    const encoder = new TextEncoder();
    let insideThink = false;
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (response.stream) {
            for await (const event of response.stream) {
              if (event.contentBlockDelta?.delta?.text) {
                const chunk = event.contentBlockDelta.delta.text;

                let text = chunk;
                if (text.includes("<think>")) {
                  insideThink = true;
                  text = text.split("<think>")[0];
                }
                if (insideThink && text.includes("</think>")) {
                  insideThink = false;
                  text = text.split("</think>").slice(1).join("</think>");
                }
                if (insideThink) continue;
                if (text) {
                  fullContent += text;
                  controller.enqueue(encoder.encode(text));
                }
              }
            }
          }

          const serviceClient = createServiceClient();
          await serviceClient.from("film_psyche_ai_reviews").insert({
            project_id: projectId,
            review_type: reviewType,
            content: fullContent,
          });

          const statusMap: Partial<Record<ReviewType, string>> = {
            evidence: "evidence_complete",
            archetype: "ai_reviewed",
            function_attitude: "ai_reviewed",
            blog_draft: "blog_drafted",
          };
          const newStatus = statusMap[reviewType];
          if (newStatus) {
            await serviceClient
              .from("film_analysis_projects")
              .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq("id", projectId);
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error(`Film psyche ${reviewType} review failed:`, error);
    return new Response("AI review failed", { status: 500 });
  }
}
