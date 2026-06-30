"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Panel,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import {
  Maximize2,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import "@xyflow/react/dist/style.css";
import { ShapePanel } from "./shape-panel";
import { CanvasNodeComponent } from "./canvas-node";
import { CanvasEdgeComponent } from "./canvas-edge";
import { NodeShape } from "./node-shape";
import type { TemplateImportRequest } from "./canvas-wrapper";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import {
  CANVAS_EDGE_TYPE,
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_TEXT,
  type CanvasEdge,
  type CanvasNode,
  type ShapeType,
} from "@/types/canvas";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

const edgeTypes = {
  [CANVAS_EDGE_TYPE]: CanvasEdgeComponent,
};

const VIEWPORT_ANIMATION_MS = 160;

let idCounter = 0;
const getId = (type: string) => `${type}-${Date.now()}-${idCounter++}`;
const getEdgeId = (connection: Connection) =>
  `${CANVAS_EDGE_TYPE}-${connection.source}-${connection.sourceHandle ?? "node"}-${connection.target}-${connection.targetHandle ?? "node"}-${Date.now()}-${idCounter++}`;

interface ControlButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "nodrag nopan nowheel flex size-8 items-center justify-center rounded-full text-copy-muted transition-colors outline-none",
        "hover:bg-accent-dim hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/60",
        "disabled:pointer-events-none disabled:opacity-35"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

interface DragPreview {
  type: ShapeType;
  width: number;
  height: number;
}

interface CollaborativeCanvasProps {
  templateImportRequest: TemplateImportRequest | null;
}

export function CollaborativeCanvas({
  templateImportRequest,
}: CollaborativeCanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const lastImportRequestIdRef = useRef<number | null>(null);

  const zoomOut = useCallback(() => {
    void reactFlow.zoomOut({ duration: VIEWPORT_ANIMATION_MS });
  }, [reactFlow]);

  const zoomIn = useCallback(() => {
    void reactFlow.zoomIn({ duration: VIEWPORT_ANIMATION_MS });
  }, [reactFlow]);

  const fitCanvas = useCallback(() => {
    void reactFlow.fitView({ duration: VIEWPORT_ANIMATION_MS, padding: 0.2 });
  }, [reactFlow]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  useKeyboardShortcuts({
    reactFlow,
    undo: handleUndo,
    redo: handleRedo,
  });

  useEffect(() => {
    if (!templateImportRequest) return;
    if (lastImportRequestIdRef.current === templateImportRequest.requestId) {
      return;
    }

    lastImportRequestIdRef.current = templateImportRequest.requestId;

    onDelete({ nodes, edges });

    const nodeChanges: NodeChange<CanvasNode>[] =
      templateImportRequest.template.nodes.map((node, index) => ({
        type: "add",
        item: { ...node, selected: false },
        index,
      }));
    const edgeChanges: EdgeChange<CanvasEdge>[] =
      templateImportRequest.template.edges.map((edge, index) => ({
        type: "add",
        item: { ...edge, selected: false },
        index,
      }));

    onNodesChange(nodeChanges);
    onEdgesChange(edgeChanges);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        void reactFlow.fitView({
          duration: VIEWPORT_ANIMATION_MS,
          padding: 0.2,
          nodes: templateImportRequest.template.nodes.map((node) => ({
            id: node.id,
          })),
        });
      });
    });
  }, [
    edges,
    nodes,
    onDelete,
    onEdgesChange,
    onNodesChange,
    reactFlow,
    templateImportRequest,
  ]);

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

      const position = reactFlow.screenToFlowPosition({
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
    [reactFlow, onNodesChange]
  );

  const onCanvasConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        onConnect(connection);
        return;
      }

      const edge: CanvasEdge = {
        id: getEdgeId(connection),
        type: CANVAS_EDGE_TYPE,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        interactionWidth: 28,
        style: {
          stroke: "var(--text-muted)",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
        },
        data: {
          label: "",
        },
      };

      onEdgesChange([{ type: "add", item: edge }]);
    },
    [onConnect, onEdgesChange]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onCanvasConnect}
        onDelete={onDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Panel
          position="bottom-left"
          className="nodrag nopan nowheel z-20 mb-24 ml-4 flex items-center rounded-full border border-border bg-elevated px-2 py-1 shadow-lg"
        >
          <div className="flex items-center gap-1">
            <ControlButton label="Zoom out" icon={ZoomOut} onClick={zoomOut} />
            <ControlButton label="Fit view" icon={Maximize2} onClick={fitCanvas} />
            <ControlButton label="Zoom in" icon={ZoomIn} onClick={zoomIn} />
          </div>
          <div className="mx-2 h-6 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1">
            <ControlButton
              label="Undo"
              icon={Undo2}
              onClick={handleUndo}
              disabled={!canUndo}
            />
            <ControlButton
              label="Redo"
              icon={Redo2}
              onClick={handleRedo}
              disabled={!canRedo}
            />
          </div>
        </Panel>
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
