"use client";

import { useState } from "react";
import { Shapes, ChevronDown, ChevronRight } from "lucide-react";

const ARCHETYPES = [
  {
    name: "Ego / Hero",
    desc: "故事主角的自我意识，承载意志和成长的主体。",
  },
  {
    name: "Parent / Mentor",
    desc: "引导和保护主角的力量，传递知识与责任感。",
  },
  {
    name: "Child",
    desc: "天真、脆弱、可能性的象征。被保护或被压抑的内在部分。",
  },
  {
    name: "Inferior",
    desc: "主角最薄弱、最不发展的心理功能的人格化。",
  },
  {
    name: "Shadow",
    desc: "主角拒绝承认的自我面向。可能是对手、镜像或恐惧的投射。",
  },
  {
    name: "Anima / Animus",
    desc: "内在对立性别的心理意象，代表关系、情感或被压抑的另一面。",
  },
  {
    name: "Wise Old Man / Woman",
    desc: "超越个人的智慧象征，代表更深层的意义、命运或宇宙秩序。",
  },
  {
    name: "Trickster",
    desc: "打破规则和秩序的力量。用幽默、混乱或意外揭示真相。",
  },
  {
    name: "Senex / Witch",
    desc: "僵化的权威或控制力量。过时的秩序，压制性的结构。",
  },
  {
    name: "Demon",
    desc: "彻底的破坏力量。代表最黑暗的心理可能性，终极对抗。",
  },
  {
    name: "Self",
    desc: "整体性的象征。超越二元对立的心理统一体。",
  },
  {
    name: "Threshold Guardian",
    desc: "守卫转变入口的力量。考验主角是否准备好进入新阶段。",
  },
  {
    name: "Messenger",
    desc: "带来召唤或关键信息的角色。打破日常平衡。",
  },
  {
    name: "Companion",
    desc: "陪伴主角的忠诚力量。反映主角品质，承载友谊与信任。",
  },
];

export function ArchetypeReferencePanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface/30">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <Shapes className="h-4 w-4" />
        原型位置参考
        {open ? (
          <ChevronDown className="ml-auto h-4 w-4" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-1.5">
          {ARCHETYPES.map((a) => (
            <div
              key={a.name}
              className="rounded-md px-3 py-2 border border-border/50"
            >
              <p className="text-sm font-medium text-text-primary">{a.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{a.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
