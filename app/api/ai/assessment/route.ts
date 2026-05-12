import { NextRequest } from "next/server";
import { ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { createClient } from "@/utils/supabase/server";
import { getBedrockClient, getModelId } from "@/lib/ai/client";
import { ASSESSMENT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { AnalysisFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data: AnalysisFormData = await request.json();

  const characterTable = data.characters
    .filter((c) => c.character_name)
    .map(
      (c) =>
        `- ${c.character_name}: ${c.archetype}${c.mbti_function ? ` (${c.mbti_function})` : ""}${c.notes ? ` — ${c.notes}` : ""}`
    )
    .join("\n");

  const userMessage = `请评估以下叙事心理分析：

**标题：** ${data.title || "未填写"}
**作品：** ${data.work_name || "未填写"} (${data.work_type})
**作者/导演：** ${data.author_director || "未填写"}

**心理学论点：**
${data.thesis || "未填写"}

**角色映射：**
${characterTable || "未填写"}

**内在冲突：**
${data.conflict_internal || "未填写"}

**外在冲突：**
${data.conflict_external || "未填写"}

**阴影表现：**
${data.shadow || "未填写"}

**投射描述：**
${data.projection || "未填写"}

**发展弧线——起始状态：**
${data.development_start || "未填写"}

**发展弧线——危机/转折点：**
${data.development_crisis || "未填写"}

**发展弧线——最终整合：**
${data.development_end || "未填写"}

**现实场景：**
${data.reflection_scenario || "未填写"}

**洞察：**
${data.reflection_insight || "未填写"}

**结语：**
${data.closing || "未填写"}`;

  try {
    const client = getBedrockClient();
    const command = new ConverseStreamCommand({
      modelId: getModelId(),
      system: [{ text: ASSESSMENT_SYSTEM_PROMPT }],
      messages: [{ role: "user", content: [{ text: userMessage }] }],
      inferenceConfig: { maxTokens: 4096 },
    });

    const response = await client.send(command);
    const encoder = new TextEncoder();
    let insideThink = false;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (response.stream) {
            for await (const event of response.stream) {
              if (event.contentBlockDelta?.delta?.text) {
                const chunk = event.contentBlockDelta.delta.text;

                // Strip <think> blocks from streaming output
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
                  controller.enqueue(encoder.encode(text));
                }
              }
            }
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
    console.error("AI assessment failed:", error);
    return new Response("AI assessment failed", { status: 500 });
  }
}
