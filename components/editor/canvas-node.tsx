import { Handle, Position } from "@xyflow/react";
import type { CanvasNodeData } from "@/types/canvas";

export function CanvasNodeComponent({ data }: { data: CanvasNodeData }) {
  // basic generic renderer for now
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md border border-brand bg-surface p-2 shadow-sm">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="text-sm font-medium text-foreground">
        {data.label || data.shape || "Node"}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
