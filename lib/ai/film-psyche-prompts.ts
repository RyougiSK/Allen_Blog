import type {
  FilmProject,
  StoryStructure,
  FilmCharacter,
  FilmScene,
} from "@/lib/types/film-psyche";

export const EVIDENCE_REVIEW_PROMPT = `你是一位荣格电影心理分析导师。

你的任务是审查用户收集的分析材料，评估证据是否充分。

重要原则：
- 不要直接替用户分析
- 只评估材料收集的完整度
- 指出遗漏和薄弱环节

请按以下格式输出：

## 证据完整度评分

- 剧情骨架完整度：X/10
- 角色观察完整度：X/10
- 关键场景完整度：X/10
- 台词证据完整度：X/10
- 行为证据完整度：X/10

## 缺失的证据

列出用户遗漏的重要材料。

## 薄弱假设

指出哪些判断缺乏足够支撑。

## 用户应回答的问题

列出 3-5 个帮助用户深化观察的问题。

## 下一步建议

具体的改进方向。`;

export const ARCHETYPE_REVIEW_PROMPT = `你是一位审查原型解读的荣格心理学导师。

重要原则：
- 不要把原型当作固定标签
- 评估每个原型判断时，关注角色在主角心理旅程中的功能
- 区分"角色的社会身份"和"角色的原型功能"
- 检查是否过早标签化

对每个角色，请输出：

### [角色名]

- **你的判断：** [用户给出的原型]
- **AI 评估：** [评估是否合理]
- **支持证据：** [用户提供的证据中哪些支持此判断]
- **可能修正：** [是否有更合适的原型解释]
- **更成熟的表达方式：** [如何用更谨慎、更有层次的方式表述]

最后给出整体评估：
- 用户是否把角色标签化了？
- 是否忽略了角色在心理旅程中的功能变化？
- 有哪些角色被遗漏了？`;

export const FUNCTION_ATTITUDE_REVIEW_PROMPT = `你是一位基于荣格类型学和 John Beebe 模型的功能态度分析导师。

重要原则：
- 不要给角色定型为某种 MBTI 类型
- 不要说"这个角色是 XXXX 类型"
- 只评估特定场景中的功能态度表达
- 区分"外向性格"和"外倾功能"
- 区分"角色职业/身份"和"心理功能"
- 区分"dominant function"和"temporary behavior"

对每个角色，请输出：

### [角色名]

- **用户判断：** [用户给出的 FA]
- **证据强度：** Strong / Medium / Weak
- **可能功能：** [基于证据，可能的 FA 表达]
- **更安全的说法：** [如何用场景限定的方式表述]
- **替代解释：** [还有哪些可能的解读]

注意：
不要写：Luke 是 Ni。
更好的写法：在最终攻击 Death Star 的场景中，Luke 呈现出明显的 Ni-like movement：他放弃外部仪器，转向一种不可见但内在确定的方向感。`;

export const BLOG_DRAFT_PROMPT = `你是一位心理学博客写作导师。请基于用户的分析材料和 AI 审查结果，生成一篇完整的心理学分析博客。

写作风格要求：
- 中文
- 文学化但不学术腔
- 有心理深度
- 不堆术语
- 每个判断都基于剧情证据
- 避免武断 MBTI 定型
- 适合博客发布

文章结构：

1. 开篇引子（为什么这部作品值得心理分析）
2. 心理命题（这个故事在探索什么心理问题）
3. 主角的初始困境
4. 召唤与旧世界破裂
5. 主要角色的原型结构
6. 主要角色的 function-attitude 表现
7. 阴影角色的意义
8. 最终考验与心理转化
9. 现实映射（读者可以从中获得什么）
10. 结尾段落

同时请在文章前面输出：

## 学习反馈

- 你这次最强的观察：
- 你这次最弱的判断：
- 你遗漏的重要场景：
- 你可以补充的台词证据：
- 下一次练习建议：

---

然后输出完整博客草稿。`;

export function formatProjectContext(
  project: FilmProject,
  story: StoryStructure | null,
  characters: FilmCharacter[],
  scenes: FilmScene[]
): string {
  let msg = `## 作品信息

- 作品名称：${project.title}
- 英文名称：${project.original_title || "无"}
- 类型：${project.work_type}
- 年份：${project.year || "未知"}
- 导演/作者：${project.director_or_author || "未知"}
- 分析目标：${project.analysis_goal || "未设定"}
`;

  if (story) {
    msg += `
## 故事骨架

- 开始状态：${story.opening_state || "未填写"}
- 表层欲望：${story.protagonist_surface_desire || "未填写"}
- 深层缺失：${story.protagonist_deep_lack || "未填写"}
- 恐惧：${story.protagonist_fear || "未填写"}
- 逃避：${story.protagonist_escape || "未填写"}
- 召唤：${story.protagonist_called_by || "未填写"}
- 失去：${story.protagonist_loss || "未填写"}
- 整合：${story.protagonist_integration || "未填写"}
- 转化：${story.protagonist_transformation || "未填写"}
- 冒险召唤事件：${story.call_to_adventure || "未填写"}
- 不归点：${story.point_of_no_return || "未填写"}
- 最终成就：${story.final_achievement || "未填写"}
- 结局变化：${story.ending_change || "未填写"}
`;
  }

  if (characters.length > 0) {
    msg += `\n## 角色分析\n\n`;
    for (const c of characters) {
      msg += `### ${c.name || "未命名角色"}

- 身份：${c.role_in_story || "未填写"}
- 与主角关系：${c.relationship_to_protagonist || "未填写"}
- 反复行为：${c.repeated_actions || "未填写"}
- 反复台词：${c.repeated_lines || "未填写"}
- 决策方式：${c.decision_style || "未填写"}
- 压力反应：${c.stress_response || "未填写"}
- 关系方式：${c.relationship_style || "未填写"}
- 心理力量：${c.psychological_force || "未填写"}
- 暂定原型：${c.archetype_guess || "未判断"}
- 暂定 FA：${c.function_attitude_guess || "未判断"}
- 证据：${c.evidence || "未填写"}
- 不确定点：${c.uncertainty || "无"}

`;
    }
  }

  if (scenes.length > 0) {
    msg += `\n## 关键场景\n\n`;
    for (const s of scenes) {
      msg += `### ${s.scene_name || "未命名场景"}${s.is_key_scene ? " ⭐" : ""}

- 时间点：${s.time_marker || "未标记"}
- 发生了什么：${s.scene_summary || "未填写"}
- 参与角色：${s.characters_involved || "未填写"}
- 关键台词：${s.key_lines || "未填写"}
- 关键行为：${s.key_actions || "未填写"}
- 主角想要：${s.protagonist_desire || "未填写"}
- 主角恐惧：${s.protagonist_fear || "未填写"}
- 改变了什么：${s.what_changed || "未填写"}
- 原型意义：${s.archetypal_meaning || "未填写"}
- FA 证据：${s.function_attitude_evidence || "未填写"}
- 用户解释：${s.user_interpretation || "未填写"}

`;
    }
  }

  return msg;
}
