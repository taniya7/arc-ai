import { Panel } from "@xyflow/react";
import { RectangleHorizontal, Diamond, Circle, Cylinder, Hexagon, Pill } from "lucide-react";

export type ShapeType = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon";

const SHAPES = [
  { type: "rectangle", icon: RectangleHorizontal, width: 160, height: 80 },
  { type: "diamond", icon: Diamond, width: 120, height: 120 },
  { type: "circle", icon: Circle, width: 100, height: 100 },
  { type: "pill", icon: Pill, width: 160, height: 60 },
  { type: "cylinder", icon: Cylinder, width: 100, height: 140 },
  { type: "hexagon", icon: Hexagon, width: 120, height: 100 },
] as const;

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shape: typeof SHAPES[number]) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(shape)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Panel
      position="bottom-center"
      className="mb-6 flex items-center gap-2 rounded-full border border-border bg-elevated px-4 py-2 shadow-lg"
    >
      {SHAPES.map((shape) => (
        <button
          key={shape.type}
          draggable
          onDragStart={(e) => onDragStart(e, shape)}
          className="flex size-10 cursor-grab items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand active:cursor-grabbing"
          title={`Drag ${shape.type}`}
        >
          <shape.icon className="size-5" />
        </button>
      ))}
    </Panel>
  );
}
