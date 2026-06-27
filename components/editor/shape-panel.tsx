"use client";

import { Panel } from "@xyflow/react";
import { RectangleHorizontal, Diamond, Circle, Cylinder, Hexagon, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_SHAPES, type ShapeType } from "@/types/canvas";

interface ShapePanelProps {
  onShapeDragStart?: (shape: {
    type: ShapeType;
    width: number;
    height: number;
  }) => void;
  onShapeDrag?: (position: { x: number; y: number }) => void;
  onShapeDragEnd?: () => void;
}

const SHAPE_ICONS = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
} satisfies Record<ShapeType, typeof RectangleHorizontal>;

const EMPTY_DRAG_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

export function ShapePanel({
  onShapeDragStart,
  onShapeDrag,
  onShapeDragEnd,
}: ShapePanelProps) {
  const onDragStart = (event: React.DragEvent, shape: (typeof NODE_SHAPES)[number]) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(shape)
    );
    event.dataTransfer.effectAllowed = "move";
    const dragImage = new Image();
    dragImage.src = EMPTY_DRAG_IMAGE;
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    onShapeDragStart?.(shape);
  };

  return (
    <Panel
      position="bottom-center"
      className="mb-6 flex items-center gap-2 rounded-full border border-border bg-elevated px-4 py-2 shadow-lg"
    >
      {NODE_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape.type];

        return (
        <button
          key={shape.type}
          draggable
          onDragStart={(e) => onDragStart(e, shape)}
          onDrag={(event) => {
            if (event.clientX === 0 && event.clientY === 0) return;
            onShapeDrag?.({ x: event.clientX, y: event.clientY });
          }}
          onDragEnd={onShapeDragEnd}
          className={cn(
            "flex size-10 cursor-grab items-center justify-center rounded-full",
            "text-copy-muted transition-colors hover:bg-accent-dim hover:text-brand",
            "active:cursor-grabbing"
          )}
          title={`Drag ${shape.type}`}
        >
          <Icon className="size-5" />
        </button>
        );
      })}
    </Panel>
  );
}
