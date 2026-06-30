"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeShape } from "./node-shape";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import {
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_TEXT,
  type CanvasNode,
} from "@/types/canvas";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 140;
const PREVIEW_PADDING = 18;
const FALLBACK_NODE_WIDTH = 140;
const FALLBACK_NODE_HEIGHT = 80;

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

type PreviewBounds = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

function getNodeWidth(node: CanvasNode) {
  return toNumber(node.style?.width, FALLBACK_NODE_WIDTH);
}

function getNodeHeight(node: CanvasNode) {
  return toNumber(node.style?.height, FALLBACK_NODE_HEIGHT);
}

function getNodeCenter(node: CanvasNode) {
  return {
    x: node.position.x + getNodeWidth(node) / 2,
    y: node.position.y + getNodeHeight(node) / 2,
  };
}

function getPreviewBounds(nodes: CanvasNode[]): PreviewBounds {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT };
  }

  const first = nodes[0];
  let minX = first.position.x;
  let minY = first.position.y;
  let maxX = first.position.x + getNodeWidth(first);
  let maxY = first.position.y + getNodeHeight(first);

  for (const node of nodes.slice(1)) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + getNodeWidth(node));
    maxY = Math.max(maxY, node.position.y + getNodeHeight(node));
  }

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function StarterTemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = getPreviewBounds(template.nodes);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height
  );
  const offsetX = (PREVIEW_WIDTH - bounds.width * scale) / 2 - bounds.minX * scale;
  const offsetY = (PREVIEW_HEIGHT - bounds.height * scale) / 2 - bounds.minY * scale;
  const nodesById = new Map(template.nodes.map((node) => [node.id, node]));

  const projectPoint = (point: { x: number; y: number }) => ({
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  });

  return (
    <div
      className="relative h-[140px] w-full overflow-hidden rounded-lg border border-border bg-base"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      >
        {template.edges.map((edge) => {
          const source = nodesById.get(edge.source);
          const target = nodesById.get(edge.target);

          if (!source || !target) {
            return null;
          }

          const sourcePoint = projectPoint(getNodeCenter(source));
          const targetPoint = projectPoint(getNodeCenter(target));

          return (
            <line
              key={edge.id}
              x1={sourcePoint.x}
              y1={sourcePoint.y}
              x2={targetPoint.x}
              y2={targetPoint.y}
              stroke="var(--text-muted)"
              strokeLinecap="round"
              strokeWidth="1.5"
              opacity="0.55"
            />
          );
        })}
      </svg>

      {template.nodes.map((node) => {
        const width = getNodeWidth(node) * scale;
        const height = getNodeHeight(node) * scale;

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.position.x * scale + offsetX,
              top: node.position.y * scale + offsetY,
              width,
              height,
            }}
          >
            <NodeShape
              shape={node.data.shape ?? "rectangle"}
              fillColor={node.data.color ?? DEFAULT_NODE_FILL}
              textColor={node.data.textColor ?? DEFAULT_NODE_TEXT}
              selected={false}
              className="h-full w-full"
              label={
                <span className="block max-w-full truncate text-[10px] leading-none">
                  {node.data.label}
                </span>
              }
            />
          </div>
        );
      })}
    </div>
  );
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-4 sm:max-w-[860px]">
        <DialogHeader className="pr-8">
          <DialogTitle>Starter Templates</DialogTitle>
          <DialogDescription>
            Replace the current canvas with a predefined architecture diagram.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-fit max-h-[min(60vh,560px)] pr-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="flex min-h-[310px] flex-col gap-3 rounded-lg border border-border bg-elevated p-3"
              >
                <StarterTemplatePreview template={template} />
                <div className="flex flex-1 flex-col gap-2">
                  <div>
                    <h3 className="text-sm font-semibold leading-tight text-foreground">
                      {template.name}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-1">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => handleImport(template)}
                    >
                      <Download className="size-3.5" />
                      Import
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
