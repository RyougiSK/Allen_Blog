"use client";

import { useReducer, useState, useCallback } from "react";
import { Plus, Save } from "lucide-react";
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
      const dup = { ...state[action.index], name: state[action.index].name + " (copy)", sort_order: state.length };
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
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function dispatchAndMarkDirty(action: Action) {
    dispatch(action);
    setDirty(true);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await saveCharacters(projectId, state);
    setSaving(false);
    if (result.success) {
      setDirty(false);
      addToast({ variant: "success", message: "Characters saved" });
    } else {
      addToast({ variant: "error", message: "Save failed" });
    }
  }, [projectId, state, addToast]);

  function handleCrossAssign(positionKey: BeebePositionKey, characterIndex: number) {
    const prevHolder = state.findIndex((c) => c.archetype_guess === positionKey);
    if (prevHolder !== -1 && prevHolder !== characterIndex) {
      dispatchAndMarkDirty({
        type: "SET",
        index: prevHolder,
        data: { ...state[prevHolder], archetype_guess: "" },
      });
    }
    dispatchAndMarkDirty({
      type: "SET",
      index: characterIndex,
      data: { ...state[characterIndex], archetype_guess: positionKey },
    });
  }

  function handleCrossUnassign(positionKey: BeebePositionKey) {
    const holder = state.findIndex((c) => c.archetype_guess === positionKey);
    if (holder !== -1) {
      dispatchAndMarkDirty({
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
                No characters yet. Add a character to begin analysis.
              </p>
            </div>
          )}

          {state.map((char, i) => (
            <CharacterCard
              key={i}
              data={char}
              index={i}
              defaultCollapsed
              onChange={(data) => dispatchAndMarkDirty({ type: "SET", index: i, data })}
              onDuplicate={() => dispatchAndMarkDirty({ type: "DUPLICATE", index: i })}
              onRemove={() => dispatchAndMarkDirty({ type: "REMOVE", index: i })}
            />
          ))}

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => dispatchAndMarkDirty({ type: "ADD" })}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Character
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="px-6"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>

          {dirty && (
            <p className="text-xs text-warning">Unsaved changes</p>
          )}
        </div>

        <div className="hidden lg:block w-72 space-y-3 sticky top-8 self-start">
          <FaReferencePanel />
          <ArchetypeReferencePanel />
        </div>
      </div>
    </div>
  );
}
