import type { Node, Edge } from "@xyflow/react";

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: string;
};

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;
