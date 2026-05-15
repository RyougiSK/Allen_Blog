"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

const FA_REFERENCE = [
  {
    code: "Se",
    name: "外倾感觉",
    focus: ["当下现实", "身体行动", "环境变化", "即时反应", "危险、速度、工具、机会"],
    evidence: [
      "角色快速行动",
      "角色依赖身体能力",
      "角色根据现场变化即时调整",
      "角色不喜欢抽象讨论",
    ],
  },
  {
    code: "Si",
    name: "内倾感觉",
    focus: ["经验", "记忆", "传统", "熟悉感", "身体安全", "过去形成的秩序"],
    evidence: [
      "角色参考过去经验",
      "角色重视熟悉的生活方式",
      "角色抗拒变化",
      "角色记得细节、惯例、承诺",
    ],
  },
  {
    code: "Ne",
    name: "外倾直觉",
    focus: ["可能性", "替代路线", "联想", "开放选择", "新机会"],
    evidence: [
      "角色不断提出新可能",
      "角色跳跃式联想",
      "角色喜欢探索未知方案",
      "角色容易被新的可能性吸引",
    ],
  },
  {
    code: "Ni",
    name: "内倾直觉",
    focus: ["命运感", "象征意义", "未来图景", "隐藏模式", "内在预感"],
    evidence: [
      "角色相信某种看不见的方向",
      "角色从事件中读出深层意义",
      "角色有强烈预感",
      "角色追随一个内在图像或使命",
    ],
  },
  {
    code: "Te",
    name: "外倾思维",
    focus: ["效率", "结果", "任务", "组织", "资源", "外部系统"],
    evidence: [
      "角色制定计划",
      "角色调动资源",
      "角色关注任务是否完成",
      "角色用结果评估行动",
    ],
  },
  {
    code: "Ti",
    name: "内倾思维",
    focus: ["原理", "结构", "定义", "一致性", "内部逻辑"],
    evidence: [
      "角色追问「这是否合理」",
      "角色拆解系统",
      "角色不轻易接受外部权威",
      "角色重视逻辑自洽",
    ],
  },
  {
    code: "Fe",
    name: "外倾情感",
    focus: ["群体关系", "情绪氛围", "责任伦理", "社会角色", "他人感受"],
    evidence: [
      "角色调节关系",
      "角色关注别人是否受伤",
      "角色承担群体责任",
      "角色用关系伦理判断行为",
    ],
  },
  {
    code: "Fi",
    name: "内倾情感",
    focus: ["个人价值", "内在忠诚", "真实感", "良心", "不可妥协的情感判断"],
    evidence: [
      "角色坚持「我不能这样做」",
      "角色不一定解释理由，但有强烈价值判断",
      "角色为了内在忠诚反抗外部压力",
      "角色重视真实自我",
    ],
  },
];

export function FaReferencePanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-surface/30">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <BookOpen className="h-4 w-4" />
        Function-Attitude 参考
        {open ? (
          <ChevronDown className="ml-auto h-4 w-4" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {FA_REFERENCE.map((fa) => (
            <div key={fa.code} className="rounded-md border border-border/50">
              <button
                onClick={() =>
                  setExpanded(expanded === fa.code ? null : fa.code)
                }
                className="flex w-full items-center gap-2 px-3 py-2 text-sm"
              >
                <span className="font-mono font-medium text-accent-warm">
                  {fa.code}
                </span>
                <span className="text-text-secondary">{fa.name}</span>
                {expanded === fa.code ? (
                  <ChevronDown className="ml-auto h-3 w-3 text-text-quaternary" />
                ) : (
                  <ChevronRight className="ml-auto h-3 w-3 text-text-quaternary" />
                )}
              </button>

              {expanded === fa.code && (
                <div className="border-t border-border/50 px-3 py-2 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-text-tertiary mb-1">
                      关注
                    </p>
                    <p className="text-xs text-text-secondary">
                      {fa.focus.join("、")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-tertiary mb-1">
                      典型证据
                    </p>
                    <ul className="space-y-0.5">
                      {fa.evidence.map((e, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-secondary pl-2 border-l border-border/50"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
