"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useHistory } from "@liveblocks/react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const EDGE_LABEL_HINT = "Add label";
const RESTING_STROKE = "var(--text-muted)";
const ACTIVE_STROKE = "var(--text-primary)";

export function CanvasEdgeComponent({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  interactionWidth = 28,
}: EdgeProps<CanvasEdge>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const history = useHistory();
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const label = data?.label ?? "";
  const isActive = selected || isHovered || isEditing;
  const edgeColor = isActive ? ACTIVE_STROKE : RESTING_STROKE;
  const markerId = `canvas-edge-arrow-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
    offset: 24,
  });

  useEffect(() => {
    if (!isEditing) {
      setDraftLabel(label);
    }
  }, [isEditing, label]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    history.pause();
    return () => {
      history.resume();
    };
  }, [history, isEditing]);

  useEffect(() => {
    if (!isEditing || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditing]);

  const stopCanvasInteraction = (event: {
    stopPropagation: () => void;
  }) => {
    event.stopPropagation();
  };

  const startEditing = (
    event: MouseEvent<SVGPathElement | HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDraftLabel(label);
    setIsEditing(true);
  };

  const commitLabel = (nextLabel: string) => {
    updateEdgeData(id, { label: nextLabel.trim() });
    setIsEditing(false);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    stopCanvasInteraction(event);

    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      commitLabel(draftLabel);
    }
  };

  const labelPointerEvents = label || isActive ? "all" : "none";

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill={edgeColor} />
        </marker>
      </defs>

      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        opacity={isActive ? 0.95 : 0.48}
        markerEnd={`url(#${markerId})`}
        className="react-flow__edge-path transition-[opacity,stroke] duration-150"
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeLinecap="round"
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction cursor-pointer"
        onDoubleClick={startEditing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: labelPointerEvents,
          }}
        >
          {isEditing ? (
            <label className="grid max-w-60 items-center">
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 whitespace-pre rounded-full border px-2.5 py-1 text-xs font-medium"
              >
                {draftLabel || EDGE_LABEL_HINT}
              </span>
              <input
                ref={inputRef}
                value={draftLabel}
                placeholder={EDGE_LABEL_HINT}
                className="nodrag nopan nowheel col-start-1 row-start-1 min-w-16 rounded-full border border-surface-border bg-elevated px-2.5 py-1 text-center text-xs font-medium text-copy-primary shadow-lg outline-none placeholder:text-copy-faint"
                onChange={(event) => setDraftLabel(event.target.value)}
                onBlur={() => commitLabel(draftLabel)}
                onKeyDown={handleInputKeyDown}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={stopCanvasInteraction}
                onDoubleClick={stopCanvasInteraction}
              />
            </label>
          ) : label || isActive ? (
            <button
              type="button"
              className={cn(
                "nodrag nopan nowheel rounded-full border bg-elevated px-2.5 py-1 text-xs font-medium shadow-sm transition-opacity",
                label
                  ? "border-surface-border text-copy-primary"
                  : "border-dashed border-surface-border-subtle text-copy-faint opacity-70"
              )}
              onDoubleClick={startEditing}
              onMouseDown={stopCanvasInteraction}
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
                stopCanvasInteraction(event)
              }
              onClick={stopCanvasInteraction}
            >
              {label || EDGE_LABEL_HINT}
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
