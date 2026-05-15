"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type { CharacterData, BeebePositionKey } from "@/lib/types/film-psyche";
import { BEEBE_POSITIONS, DIALOGICAL_PAIRS } from "@/lib/types/film-psyche";

interface Props {
  characters: CharacterData[];
  onAssign: (positionKey: BeebePositionKey, characterIndex: number) => void;
  onUnassign: (positionKey: BeebePositionKey) => void;
}

const NODE_COORDS: Record<BeebePositionKey, { x: number; y: number }> = {
  hero: { x: 50, y: 8 },
  good_parent: { x: 15, y: 32 },
  puer: { x: 85, y: 32 },
  anima: { x: 50, y: 52 },
  opposing: { x: 50, y: 68 },
  senex: { x: 15, y: 85 },
  trickster: { x: 85, y: 85 },
  demon: { x: 50, y: 97 },
};

const CROSS_ARMS: [BeebePositionKey, BeebePositionKey][] = [
  ["hero", "good_parent"],
  ["hero", "puer"],
  ["hero", "anima"],
  ["good_parent", "anima"],
  ["puer", "anima"],
  ["opposing", "senex"],
  ["opposing", "trickster"],
  ["opposing", "demon"],
  ["senex", "demon"],
  ["trickster", "demon"],
];

export function BeebeCross({ characters, onAssign, onUnassign }: Props) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState<BeebePositionKey | null>(null);
  const [selecting, setSelecting] = useState<BeebePositionKey | null>(null);

  const assignments = new Map<BeebePositionKey, { name: string; fa: string; index: number }>();
  characters.forEach((c, i) => {
    const pos = BEEBE_POSITIONS.find((p) => p.key === c.archetype_guess);
    if (pos && c.name) {
      assignments.set(pos.key, { name: c.name, fa: c.function_attitude_guess, index: i });
    }
  });

  const hoveredPairs = hovered
    ? DIALOGICAL_PAIRS.filter(([a, b]) => a === hovered || b === hovered)
    : [];
  const hoveredPartners = new Set(
    hoveredPairs.flatMap(([a, b]) => [a, b]).filter((k) => k !== hovered)
  );

  const unassignedCharacters = characters
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => c.name && !BEEBE_POSITIONS.some((p) => p.key === c.archetype_guess));

  function isEgoPosition(key: BeebePositionKey) {
    return BEEBE_POSITIONS.find((p) => p.key === key)?.cross === "ego";
  }

  return (
    <div className="rounded-lg border border-border-emphasis bg-bg-primary overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-5 py-3.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-display tracking-wide">双十字原型结构</span>
        <span className="text-xs text-text-quaternary ml-1">(Beebe Model)</span>
        <span className="ml-auto text-xs text-text-quaternary">
          {assignments.size}/8 已分配
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-6 md:px-8 md:py-8">
          <div
            className="relative mx-auto w-full max-w-[560px]"
            style={{ aspectRatio: "1 / 1.15" }}
          >
            {/* Radial gradient background glow */}
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, rgba(201,183,156,0.03) 0%, transparent 60%)`,
                }}
              />
            </div>

            {/* SVG lines layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              {/* Cross structural arms */}
              {CROSS_ARMS.map(([a, b]) => {
                const from = NODE_COORDS[a];
                const to = NODE_COORDS[b];
                const bothOccupied = assignments.has(a) && assignments.has(b);
                return (
                  <line
                    key={`arm-${a}-${b}`}
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    opacity={bothOccupied ? 0.5 : 0.2}
                  />
                );
              })}

              {/* Dialogical tension lines */}
              {DIALOGICAL_PAIRS.map(([a, b]) => {
                const from = NODE_COORDS[a];
                const to = NODE_COORDS[b];
                const bothOccupied = assignments.has(a) && assignments.has(b);
                const isHighlighted = hovered === a || hovered === b;
                return (
                  <line
                    key={`pair-${a}-${b}`}
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="var(--color-accent-warm)"
                    strokeWidth={isHighlighted ? "1.5" : "1"}
                    strokeDasharray={bothOccupied ? "none" : "4 4"}
                    opacity={isHighlighted ? 0.6 : bothOccupied ? 0.3 : 0.08}
                    style={bothOccupied && !isHighlighted ? { animation: "line-pulse 4s ease-in-out infinite" } : undefined}
                  />
                );
              })}

              {/* Threshold line */}
              <line
                x1="10%"
                y1="60%"
                x2="90%"
                y2="60%"
                stroke="var(--color-border-emphasis)"
                strokeWidth="1"
                strokeDasharray="2 6"
                opacity="0.5"
              />
            </svg>

            {/* Threshold label */}
            <div
              className="absolute left-1/2 -translate-x-1/2 px-3 py-0.5 bg-bg-primary z-10"
              style={{ top: "58.5%" }}
            >
              <span className="text-[10px] tracking-widest uppercase text-text-quaternary">
                — 阈限 Threshold —
              </span>
            </div>

            {/* Cross labels */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[1%] z-10">
              <span className="text-[9px] tracking-widest uppercase text-accent-self-light/60">
                Ego-syntonic
              </span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: "63%" }}>
              <span className="text-[9px] tracking-widest uppercase text-accent-nature-light/60">
                Ego-dystonic
              </span>
            </div>

            {/* Node buttons */}
            {BEEBE_POSITIONS.map((pos) => {
              const coords = NODE_COORDS[pos.key];
              const assigned = assignments.get(pos.key);
              const isHovered = hovered === pos.key;
              const isPartner = hoveredPartners.has(pos.key);
              const isSelecting_ = selecting === pos.key;
              const isEgo = isEgoPosition(pos.key);

              return (
                <div
                  key={pos.key}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  onMouseEnter={() => setHovered(pos.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    onClick={() => setSelecting(isSelecting_ ? null : pos.key)}
                    className={`relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full border-2 transition-all duration-200 ${
                      assigned
                        ? isEgo
                          ? "border-accent-warm/60 bg-accent-warm/5"
                          : "border-accent-nature/60 bg-accent-nature/5"
                        : "border-dashed border-border/50 bg-transparent"
                    } ${isHovered || isPartner ? "scale-105" : ""} ${
                      isSelecting_ ? "ring-2 ring-accent-warm/40" : ""
                    }`}
                    style={
                      assigned
                        ? {
                            animation: isEgo
                              ? "node-breathe 3.5s ease-in-out infinite"
                              : "node-breathe-shadow 3.5s ease-in-out infinite",
                          }
                        : undefined
                    }
                  >
                    {/* Rotating ring for selecting state */}
                    {isSelecting_ && (
                      <div
                        className="absolute inset-[-6px] rounded-full border border-dashed border-accent-warm/40"
                        style={{ animation: "ring-rotate 12s linear infinite" }}
                      />
                    )}

                    {/* Position label */}
                    <span className="text-[8px] font-medium uppercase tracking-wider text-text-quaternary leading-none text-center px-1">
                      {pos.label.split(" / ")[0]}
                    </span>

                    {/* Character name */}
                    {assigned ? (
                      <span className="mt-0.5 text-[11px] font-medium text-accent-warm truncate max-w-[64px] text-center leading-tight">
                        {assigned.name}
                      </span>
                    ) : (
                      <span className="mt-0.5 text-[10px] text-text-quaternary/50 italic">○</span>
                    )}

                    {/* FA badge */}
                    {assigned?.fa && (
                      <span className="mt-0.5 text-[8px] text-text-tertiary">{assigned.fa}</span>
                    )}
                  </button>

                  {/* Assignment dropdown */}
                  {isSelecting_ && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2 w-44 rounded-md border border-border bg-bg-secondary shadow-lg overflow-hidden">
                      {assigned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnassign(pos.key);
                            setSelecting(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 border-b border-border/50"
                        >
                          <X className="h-3 w-3" />
                          移除 {assigned.name}
                        </button>
                      )}
                      {unassignedCharacters.length === 0 && !assigned && (
                        <p className="px-3 py-2 text-xs text-text-quaternary">没有可分配的角色</p>
                      )}
                      {unassignedCharacters.map((c) => (
                        <button
                          key={c.index}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign(pos.key, c.index);
                            setSelecting(null);
                          }}
                          className="flex w-full items-center px-3 py-2 text-xs text-text-secondary hover:bg-surface/50 transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                      {characters
                        .map((c, i) => ({ ...c, index: i }))
                        .filter(
                          (c) =>
                            c.name &&
                            BEEBE_POSITIONS.some((p) => p.key === c.archetype_guess) &&
                            c.archetype_guess !== pos.key
                        )
                        .map((c) => (
                          <button
                            key={c.index}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssign(pos.key, c.index);
                              setSelecting(null);
                            }}
                            className="flex w-full items-center px-3 py-2 text-xs text-text-quaternary hover:bg-surface/50 transition-colors"
                          >
                            {c.name}
                            <span className="ml-auto text-[10px]">
                              (从{BEEBE_POSITIONS.find((p) => p.key === c.archetype_guess)?.label}移来)
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dialogical pairs legend */}
          <div className="mt-8 border-t border-border/30 pt-5 max-w-[560px] mx-auto">
            <p className="text-[10px] font-medium text-text-quaternary uppercase tracking-wider mb-3">
              对话张力对 (Dialogical Pairs)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {DIALOGICAL_PAIRS.map(([a, b, desc]) => {
                const aAssigned = assignments.has(a);
                const bAssigned = assignments.has(b);
                const bothActive = aAssigned && bAssigned;
                const isHighlighted = hovered === a || hovered === b;

                return (
                  <div
                    key={`${a}-${b}`}
                    className={`rounded px-2 py-1.5 border transition-all duration-200 ${
                      isHighlighted
                        ? "border-accent-warm/50 bg-accent-warm/5"
                        : bothActive
                          ? "border-border bg-surface/30"
                          : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          aAssigned ? "bg-accent-warm" : "bg-border"
                        }`}
                      />
                      <span className="text-[10px] text-text-tertiary">↔</span>
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          bAssigned ? "bg-accent-warm" : "bg-border"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-text-quaternary mt-0.5 leading-tight">
                      {desc}
                    </p>
                    {bothActive && (
                      <p className="text-[10px] text-accent-warm mt-0.5">
                        {assignments.get(a)!.name} ↔ {assignments.get(b)!.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
