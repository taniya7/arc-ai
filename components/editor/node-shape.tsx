"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ShapeType } from "@/types/canvas";

interface NodeShapeProps {
  shape: ShapeType;
  label?: ReactNode;
  selected?: boolean;
  fillColor?: string;
  textColor?: string;
  className?: string;
}

const RESTING_STROKE = "var(--border-subtle)";
const SELECTED_STROKE = "var(--accent-primary)";
const DEFAULT_FILL = "var(--bg-subtle)";
const DEFAULT_TEXT = "var(--text-primary)";

function SvgShape({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function NodeShape({
  shape,
  label,
  selected = false,
  fillColor = DEFAULT_FILL,
  textColor = DEFAULT_TEXT,
  className,
}: NodeShapeProps) {
  const strokeColor = selected ? SELECTED_STROKE : RESTING_STROKE;
  const cssShapeStyle = {
    backgroundColor: fillColor,
    borderColor: strokeColor,
    color: textColor,
  } satisfies CSSProperties;

  return (
    <div className={cn("relative flex h-full w-full items-center justify-center", className)}>
      {shape === "rectangle" ? (
        <div className="absolute inset-0 rounded-2xl border" style={cssShapeStyle} />
      ) : null}

      {shape === "pill" ? (
        <div className="absolute inset-0 rounded-full border" style={cssShapeStyle} />
      ) : null}

      {shape === "circle" ? (
        <div className="absolute inset-0 rounded-full border" style={cssShapeStyle} />
      ) : null}

      {shape === "diamond" ? (
        <SvgShape>
          <polygon
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            points="50,2 98,50 50,98 2,50"
          />
        </SvgShape>
      ) : null}

      {shape === "hexagon" ? (
        <SvgShape>
          <polygon
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            points="25,2 75,2 98,50 75,98 25,98 2,50"
          />
        </SvgShape>
      ) : null}

      {shape === "cylinder" ? (
        <SvgShape>
          <rect fill={fillColor} x="12" y="16" width="76" height="68" />
          <ellipse
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            cx="50"
            cy="16"
            rx="38"
            ry="14"
          />
          <path
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            d="M12 16V84C12 91.732 29.013 98 50 98C70.987 98 88 91.732 88 84V16"
          />
          <path
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            d="M12 84C12 91.732 29.013 98 50 98C70.987 98 88 91.732 88 84"
          />
        </SvgShape>
      ) : null}

      {label ? (
        <div
          className="relative z-10 w-[72%] text-center text-sm font-medium"
          style={{ color: textColor }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
