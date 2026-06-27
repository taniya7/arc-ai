import { useEffect, useRef, useState } from "react";
import { useHistory, useMutation } from "@liveblocks/react";
import type { NodeProps } from "@xyflow/react";
import { Handle, NodeResizer, NodeToolbar, Position } from "@xyflow/react";
import { NodeShape } from "./node-shape";
import {
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_TEXT,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
  NODE_COLORS,
  type CanvasNode,
} from "@/types/canvas";

const EMPTY_LABEL_PLACEHOLDER = "Untitled";

interface FlowStorageNodeData {
  set: (key: "label" | "color" | "textColor", value: string) => void;
  get: (key: "color" | "textColor") => string | undefined;
}

interface FlowStorageNode {
  get: (key: "data") => FlowStorageNodeData | undefined;
}

interface FlowStorageNodesMap {
  get: (id: string) => FlowStorageNode | undefined;
}

interface FlowStorageRoot {
  get: (key: "flow") => {
    get: (key: "nodes") => FlowStorageNodesMap;
  } | undefined;
}

export function CanvasNodeComponent({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data.label ?? "");
  const [hoveredSwatch, setHoveredSwatch] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const history = useHistory();
  const currentFillColor = data.color ?? DEFAULT_NODE_FILL;
  const currentTextColor = data.textColor ?? DEFAULT_NODE_TEXT;

  const updateNodeLabel = useMutation(({ storage }, nextLabel: string) => {
    const flow = (storage as unknown as FlowStorageRoot).get("flow");
    if (!flow) {
      return;
    }

    const node = flow.get("nodes").get(id);
    if (!node) {
      return;
    }

    const nodeData = node.get("data");
    nodeData?.set?.("label", nextLabel);
  }, [id]);

  const updateNodeColors = useMutation(
    ({ storage }, nextColors: { color: string; textColor: string }) => {
      const flow = (storage as unknown as FlowStorageRoot).get("flow");
      if (!flow) {
        return;
      }

      const node = flow.get("nodes").get(id);
      if (!node) {
        return;
      }

      const nodeData = node.get("data");
      if (!nodeData) {
        return;
      }

      nodeData.set("color", nextColors.color);
      nodeData.set("textColor", nextColors.textColor);
    },
    [id]
  );

  useEffect(() => {
    if (!isEditing) {
      setDraftLabel(data.label ?? "");
    }
  }, [data.label, isEditing]);

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
    if (!isEditing || !textareaRef.current) {
      return;
    }

    textareaRef.current.focus();
    const textLength = textareaRef.current.value.length;
    textareaRef.current.setSelectionRange(textLength, textLength);
  }, [isEditing]);

  const stopCanvasInteraction = (event: {
    stopPropagation: () => void;
  }) => {
    event.stopPropagation();
  };

  const commitLabel = (nextLabel: string) => {
    updateNodeLabel(nextLabel);
    setIsEditing(false);
  };

  return (
    <div className="group relative h-full w-full">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={14}
        className="nodrag nopan nowheel"
      >
        <div className="flex items-center gap-1.5 rounded-full border border-surface-border bg-elevated px-2 py-1 shadow-lg">
          {NODE_COLORS.map((palette) => {
            const isActive =
              palette.fill === currentFillColor &&
              palette.text === currentTextColor;
            const isHovered = hoveredSwatch === palette.fill;

            return (
              <button
                key={`${palette.fill}-${palette.text}`}
                type="button"
                aria-label={`Set node color ${palette.fill}`}
                aria-pressed={isActive}
                className="nodrag nopan nowheel flex size-6 items-center justify-center rounded-full border transition-all outline-none"
                style={{
                  backgroundColor: palette.fill,
                  borderColor: isActive ? palette.text : "var(--border-subtle)",
                  boxShadow: isActive
                    ? `0 0 0 1px ${palette.text}, 0 0 8px color-mix(in srgb, ${palette.text} 30%, transparent)`
                    : isHovered
                      ? `0 0 0 1px color-mix(in srgb, ${palette.text} 45%, var(--border-subtle)), 0 0 6px color-mix(in srgb, ${palette.text} 25%, transparent)`
                      : undefined,
                }}
                onClick={() =>
                  updateNodeColors({
                    color: palette.fill,
                    textColor: palette.text,
                  })
                }
                onMouseEnter={() => setHoveredSwatch(palette.fill)}
                onMouseLeave={() => setHoveredSwatch((current) => current === palette.fill ? null : current)}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={stopCanvasInteraction}
                onDoubleClick={stopCanvasInteraction}
              >
                <span
                  className="pointer-events-none size-2.5 rounded-full"
                  style={{
                    backgroundColor: palette.text,
                    boxShadow: `0 0 6px color-mix(in srgb, ${palette.text} 45%, transparent)`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </NodeToolbar>

      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color="var(--border-subtle)"
        handleClassName="!h-3 !w-3 !rounded-[4px] !border !border-surface-border-subtle !bg-elevated"
        lineClassName="!border-surface-border-subtle"
        handleStyle={{ boxShadow: "0 0 0 1px var(--bg-base)" }}
        lineStyle={{ borderWidth: 1 }}
      />

      <Handle
        type="target"
        position={Position.Top}
        className="!size-3 !border-2 !border-copy-primary !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !border-2 !border-copy-primary !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !border-2 !border-copy-primary !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-3 !border-2 !border-copy-primary !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100"
      />

      <NodeShape
        shape={data.shape ?? "rectangle"}
        label={
          isEditing ? (
            <textarea
              ref={textareaRef}
              value={draftLabel}
              rows={2}
              placeholder={EMPTY_LABEL_PLACEHOLDER}
              className="nodrag nopan nowheel block min-h-10 w-full resize-none overflow-hidden bg-transparent px-1 text-center text-sm leading-5 outline-none placeholder:text-copy-faint"
              style={{ color: currentTextColor }}
              onChange={(event) => {
                const nextLabel = event.target.value;
                setDraftLabel(nextLabel);
                updateNodeLabel(nextLabel);
              }}
              onBlur={() => commitLabel(draftLabel)}
              onKeyDown={(event) => {
                stopCanvasInteraction(event);
                if (event.key === "Escape") {
                  event.preventDefault();
                  commitLabel(draftLabel);
                }
              }}
              onMouseDown={stopCanvasInteraction}
              onPointerDown={stopCanvasInteraction}
              onDoubleClick={stopCanvasInteraction}
            />
          ) : (
            <div
              className="nodrag nopan nowheel flex min-h-10 w-full cursor-text items-center justify-center px-1 text-center text-sm leading-5"
              style={{ color: currentTextColor }}
              onDoubleClick={(event) => {
                stopCanvasInteraction(event);
                setIsEditing(true);
              }}
              onMouseDown={stopCanvasInteraction}
              onPointerDown={stopCanvasInteraction}
            >
              {draftLabel || (
                <span
                  className="opacity-60"
                  style={{ color: currentTextColor }}
                >
                  {EMPTY_LABEL_PLACEHOLDER}
                </span>
              )}
            </div>
          )
        }
        selected={selected}
        fillColor={currentFillColor}
        textColor={currentTextColor}
        className="h-full w-full"
      />
    </div>
  );
}
