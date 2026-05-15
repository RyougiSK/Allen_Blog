"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { saveCharacters } from "@/lib/actions/film-psyche";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { CharacterCard } from "./character-card";
import { BeebeCross } from "./beebe-cross";
import { FaReferencePanel } from "./fa-reference-panel";
import { ArchetypeReferencePanel } from "./archetype-reference-panel";
import type { FilmCharacter, CharacterData, BeebePositionKey } from "@/lib/types/film-psyche";
import { BEEBE_POSITIONS } from "@/lib/types/film-psyche";

type Action =
  | { type: "SET"; index: number; data: CharacterData }
  | { type: "ADD" }
  | { type: "DUPLICATE"; index: number }
  | { type: "REMOVE"; index: number }
  | { type: "RESET"; data: CharacterData[] };

const EMPTY_CHARACTER: CharacterData = {
  name: "",
  role_in_story: "",
  relationship_to_protagonist: "",
  repeated_actions: "",
  repeated_lines: "",
  decision_style: "",
  stress_response: "",
  relationship_style: "",
  psychological_force: "",
  archetype_guess: "",
  function_attitude_guess: "",
  evidence: "",
  uncertainty: "",
  sort_order: 0,
};

function reducer(state: CharacterData[], action: Action): CharacterData[] {
  switch (action.type) {
    case "SET":
      return state.map((c, i) => (i === action.index ? action.data : c));
    case "ADD":
      return [...state, { ...EMPTY_CHARACTER, sort_order: state.length }];
    case "DUPLICATE": {
      const dup = { ...state[action.index], name: state[action.index].name + " (副本)", sort_order: state.length };
      return [...state, dup];
    }
    case "REMOVE":
      return state.filter((_, i) => i !== action.index);
    case "RESET":
      return action.data;
  }
}

function toCharacterData(chars: FilmCharacter[]): CharacterData[] {
  return chars.map(({ id, project_id, ...rest }) => rest);
}

interface Props {
  projectId: string;
  characters: FilmCharacter[];
}

export function CharacterCardsPage({ projectId, characters }: Props) {
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, toCharacterData(characters));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const autoSave = useCallback(async () => {
    const result = await saveCharacters(projectId, state);
    if (!result.success) {
      addToast({ variant: "error", message: "自动保存失败" });
    }
  }, [projectId, state, addToast]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(autoSave, 2000);
    return () => clearTimeout(timerRef.current);
  }, [state, autoSave]);

  function handleCrossAssign(positionKey: BeebePositionKey, characterIndex: number) {
    const prevHolder = state.findIndex((c) => c.archetype_guess === positionKey);
    if (prevHolder !== -1 && prevHolder !== characterIndex) {
      dispatch({
        type: "SET",
        index: prevHolder,
        data: { ...state[prevHolder], archetype_guess: "" },
      });
    }
    dispatch({
      type: "SET",
      index: characterIndex,
      data: { ...state[characterIndex], archetype_guess: positionKey },
    });
  }

  function handleCrossUnassign(positionKey: BeebePositionKey) {
    const holder = state.findIndex((c) => c.archetype_guess === positionKey);
    if (holder !== -1) {
      dispatch({
        type: "SET",
        index: holder,
        data: { ...state[holder], archetype_guess: "" },
      });
    }
  }

  return (
    <div className="space-y-6">
      {state.length > 0 && (
        <BeebeCross
          characters={state}
          onAssign={handleCrossAssign}
          onUnassign={handleCrossUnassign}
        />
      )}

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {state.length === 0 && (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-text-tertiary">
                还没有角色卡片。添加你想分析的角色。
              </p>
            </div>
          )}

          {state.map((char, i) => (
            <CharacterCard
              key={i}
              data={char}
              index={i}
              onChange={(data) => dispatch({ type: "SET", index: i, data })}
              onDuplicate={() => dispatch({ type: "DUPLICATE", index: i })}
              onRemove={() => dispatch({ type: "REMOVE", index: i })}
            />
          ))}

          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "ADD" })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            添加角色
          </Button>

          <p className="text-xs text-text-quaternary">修改将自动保存</p>
        </div>

        <div className="hidden lg:block w-72 space-y-3 sticky top-8 self-start">
          <FaReferencePanel />
          <ArchetypeReferencePanel />
        </div>
      </div>
    </div>
  );
}
