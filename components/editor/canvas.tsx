"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ShapePanel } from "./shape-panel";
import { CanvasNodeComponent } from "./canvas-node";
import { NodeShape } from "./node-shape";
import {
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_TEXT,
  type CanvasNode,
  type ShapeType,
} from "@/types/canvas";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

let idCounter = 0;
const getId = (type: string) => `${type}-${Date.now()}-${idCounter++}`;

interface DragPreview {
  type: ShapeType;
  width: number;
  height: number;
}

export function CollaborativeCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({ suspense: true });

  const { screenToFlowPosition } = useReactFlow();
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!dragPreview) return;

    const handleDragOver = (event: DragEvent) => {
      if (event.clientX === 0 && event.clientY === 0) return;
      setDragPosition({ x: event.clientX, y: event.clientY });
    };

    const clearPreview = () => {
      setDragPreview(null);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", clearPreview);
    window.addEventListener("dragend", clearPreview);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", clearPreview);
      window.removeEventListener("dragend", clearPreview);
    };
  }, [dragPreview]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const typeData = event.dataTransfer.getData("application/reactflow");
      if (!typeData) return;

      const shape = JSON.parse(typeData);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Offset by half the shape width/height to center on mouse
      const centeredPosition = {
        x: position.x - shape.width / 2,
        y: position.y - shape.height / 2,
      };

      const newNode: CanvasNode = {
        id: getId(shape.type),
        type: "canvasNode",
        position: centeredPosition,
        data: {
          label: "",
          shape: shape.type,
          color: DEFAULT_NODE_FILL,
          textColor: DEFAULT_NODE_TEXT,
        },
        style: { width: shape.width, height: shape.height },
      };

      onNodesChange([{ type: "add", item: newNode }]);
      setDragPreview(null);
    },
    [screenToFlowPosition, onNodesChange]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <ShapePanel
          onShapeDragStart={(shape) => {
            setDragPreview(shape);
            setDragPosition({ x: shape.width / 2, y: shape.height / 2 });
          }}
          onShapeDrag={setDragPosition}
          onShapeDragEnd={() => setDragPreview(null)}
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border-subtle)" />
        <MiniMap
          className={`hover:after:content-['Mini Map'] after:absolute after:-top-9 after:right-0 after:bg-elevated after:px-2 after:py-1 after:text-[11px] after:font-medium after:rounded-md after:border after:border-border after:shadow-sm after:text-foreground after:pointer-events-none after:opacity-0 hover:after:opacity-500 after:transition-opacity`}
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius)"
          }}
          nodeColor="var(--border-subtle)"
          maskColor="rgba(8, 8, 9, 0.7)"
        />
      </ReactFlow>

      {dragPreview ? (
        <div
          className="pointer-events-none fixed left-0 top-0 z-50 opacity-85"
          style={{
            width: dragPreview.width,
            height: dragPreview.height,
            transform: `translate(${dragPosition.x - dragPreview.width / 2}px, ${dragPosition.y - dragPreview.height / 2}px)`,
          }}
        >
          <NodeShape
            shape={dragPreview.type}
            selected={false}
            fillColor={DEFAULT_NODE_FILL}
            textColor={DEFAULT_NODE_TEXT}
            className="h-full w-full drop-shadow-lg"
          />
        </div>
      ) : null}
    </div>
  );
}
