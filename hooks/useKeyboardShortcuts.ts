"use client";

import { useEffect } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> {
  reactFlow: ReactFlowInstance<NodeType, EdgeType>;
  undo: () => void;
  redo: () => void;
}

const VIEWPORT_ANIMATION_MS = 160;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable ||
    target.closest("[contenteditable='true']") !== null ||
    target.getAttribute("role") === "textbox"
  );
}

export function useKeyboardShortcuts<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsOptions<NodeType, EdgeType>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const isCommand = event.metaKey || event.ctrlKey;

      if (isCommand && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isCommand && key === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: VIEWPORT_ANIMATION_MS });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: VIEWPORT_ANIMATION_MS });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlow, redo, undo]);
}
