import type { Node, Edge } from "@xyflow/react";

export type ShapeType =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export const NODE_SHAPES = [
  { type: "rectangle", width: 160, height: 80 },
  { type: "diamond", width: 120, height: 120 },
  { type: "circle", width: 100, height: 100 },
  { type: "pill", width: 160, height: 60 },
  { type: "cylinder", width: 100, height: 140 },
  { type: "hexagon", width: 120, height: 100 },
] as const satisfies ReadonlyArray<{
  type: ShapeType;
  width: number;
  height: number;
}>;

export const DEFAULT_NODE_FILL = "#1F1F1F";
export const DEFAULT_NODE_TEXT = "#EDEDED";
export const MIN_NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 48;
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const;

export type CanvasNodeData = {
  label: string;
  color?: string;
  textColor?: string;
  shape?: ShapeType;
};

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;
