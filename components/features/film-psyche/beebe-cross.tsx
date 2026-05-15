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
  hero: { x: 50, y: 10 },
  good_parent: { x: 15, y: 30 },
  puer: { x: 85, y: 30 },
  anima: { x: 50, y: 50 },
  opposing: { x: 50, y: 66 },
  senex: { x: 15, y: 82 },
  trickster: { x: 85, y: 82 },
  demon: { x: 50, y: 95 },
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

const ARCHETYPE_ICONS: Record<BeebePositionKey, string> = {
  hero: "M12 3L4 7v5c0 4.5 3.5 8.5 8 10 4.5-1.5 8-5.5 8-10V7l-8-4z",
  good_parent: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  puer: "M12 2l2.4 5.2H20l-4.5 3.5 1.7 5.3L12 13l-5.2 3 1.7-5.3L4 7.2h5.6z",
  anima: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  opposing: "M6 4l12 16M18 4L6 20M3 12h4M17 12h4",
  senex: "M6 4h12M6 20h12M8 4l4 8-4 8M16 4l-4 8 4 8",
  trickster: "M12 12m0 0a1.5 1.5 0 1 0 2.5 1 3.5 3.5 0 1 1-5-1.5 5.5 5.5 0 1 0 8 2 7.5 7.5 0 1 1-11-3",
  demon: "M5 5h14l-7 14zM12 5c0-1.5 1-2.5 1.5-3S12 1 12 1s-1 .5-1.5 1.5S12 3.5 12 5",
};

function ArchetypeIcon({ archetype, size = 20, className = "" }: { archetype: BeebePositionKey; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ARCHETYPE_ICONS[archetype]} />
    </svg>
  );
}

export function BeebeCross({ characters, onAssign, onUnassign }: Props) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState<BeebePositionKey | null>(null);
  const [selecting, setSelecting] = useState<BeebePositionKey | null>(null);

  const assignments = new Map<BeebePositionKey, { name: string; fa: string; index: number }>();
  characters.forEach((c, i) => {
    const pos = BEEBE_POSITIONS.find((p) => p.key === c.archetype_guess);
    if (pos) {
      assignments.set(pos.key, { name: c.name || `Character #${i + 1}`, fa: c.function_attitude_guess, index: i });
    }
  });

  const hoveredPairs = hovered
    ? DIALOGICAL_PAIRS.filter(([a, b]) => a === hovered || b === hovered)
    : [];
  const hoveredPartners = new Set(
    hoveredPairs.flatMap(([a, b]) => [a, b]).filter((k) => k !== hovered)
  );

  const unassignedCharacters = characters
    .map((c, i) => ({ ...c, index: i, displayName: c.name || `Character #${i + 1}` }))
    .filter((c) => !BEEBE_POSITIONS.some((p) => p.key === c.archetype_guess));

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
        <span className="font-display tracking-wide text-base">Beebe Double-Cross</span>
        <span className="ml-auto text-xs text-text-quaternary">
          {assignments.size}/8 assigned
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-6 md:px-8 md:py-8">
          <div
            className="relative mx-auto w-full max-w-[600px]"
            style={{ aspectRatio: "1 / 1.2" }}
          >
            {/* Consciousness background (top half) */}
            <div
              className="absolute inset-x-0 top-0 rounded-t-lg overflow-hidden pointer-events-none"
              style={{ height: "58%" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 60%, rgba(90, 92, 122, 0.06) 0%, rgba(90, 92, 122, 0.02) 40%, transparent 70%)`,
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, rgba(90, 92, 122, 0.15), transparent)`,
                }}
              />
            </div>

            {/* Unconsciousness background (bottom half) */}
            <div
              className="absolute inset-x-0 bottom-0 rounded-b-lg overflow-hidden pointer-events-none"
              style={{ height: "42%" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, rgba(47, 79, 79, 0.08) 0%, rgba(47, 79, 79, 0.03) 40%, transparent 70%)`,
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
                x1="8%"
                y1="58%"
                x2="92%"
                y2="58%"
                stroke="var(--color-border-emphasis)"
                strokeWidth="1"
                strokeDasharray="2 6"
                opacity="0.4"
              />
            </svg>

            {/* Threshold label */}
            <div
              className="absolute left-1/2 -translate-x-1/2 px-4 py-1 bg-bg-primary z-10"
              style={{ top: "56.5%" }}
            >
              <span className="text-[11px] tracking-[0.15em] uppercase text-text-quaternary font-medium">
                — Threshold —
              </span>
            </div>

            {/* Realm labels */}
            <div className="absolute left-4 top-[2%] z-10">
              <span className="text-[10px] tracking-widest uppercase text-accent-self-light/50 font-medium">
                Consciousness
              </span>
            </div>
            <div className="absolute left-4 z-10" style={{ top: "61%" }}>
              <span className="text-[10px] tracking-widest uppercase text-accent-nature-light/50 font-medium">
                Unconscious
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
                    className={`relative flex flex-col items-center justify-center w-[96px] h-[96px] rounded-full border-2 transition-all duration-200 ${
                      assigned
                        ? isEgo
                          ? "border-accent-self/50 bg-accent-self/5"
                          : "border-accent-nature/50 bg-accent-nature/5"
                        : isEgo
                          ? "border-dashed border-accent-self/20 bg-accent-self/[0.02]"
                          : "border-dashed border-accent-nature/20 bg-accent-nature/[0.02]"
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

                    {/* Archetype icon */}
                    <ArchetypeIcon
                      archetype={pos.key}
                      size={22}
                      className={
                        assigned
                          ? isEgo
                            ? "text-accent-warm/80"
                            : "text-accent-nature-light/80"
                          : "text-text-quaternary/40"
                      }
                    />

                    {/* Position label */}
                    <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-text-quaternary leading-none text-center px-1">
                      {pos.label.split(" / ")[0]}
                    </span>

                    {/* Character name */}
                    {assigned ? (
                      <span className="mt-0.5 text-[11px] font-medium text-accent-warm truncate max-w-[80px] text-center leading-tight">
                        {assigned.name}
                      </span>
                    ) : null}

                    {/* FA badge */}
                    {assigned?.fa && (
                      <span className="mt-0.5 text-[9px] text-text-tertiary">{assigned.fa}</span>
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
                          Remove {assigned.name}
                        </button>
                      )}
                      {unassignedCharacters.length === 0 && !assigned && (
                        <p className="px-3 py-2 text-xs text-text-quaternary">
                          No unassigned characters
                        </p>
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
                          {c.displayName}
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
                              (from {BEEBE_POSITIONS.find((p) => p.key === c.archetype_guess)?.label})
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
          <div className="mt-8 border-t border-border/30 pt-5 max-w-[600px] mx-auto">
            <p className="text-[11px] font-medium text-text-quaternary uppercase tracking-wider mb-3">
              Dialogical Tension Pairs
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
