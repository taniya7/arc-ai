"use client";

import { Component, ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { ReactFlowProvider } from "@xyflow/react";
import { CollaborativeCanvas } from "./canvas";
import type { CanvasTemplate } from "./starter-templates";

export interface TemplateImportRequest {
  requestId: number;
  template: CanvasTemplate;
}

interface CanvasWrapperProps {
  roomId: string;
  templateImportRequest: TemplateImportRequest | null;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>Failed to connect to the collaboration room.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-brand hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CanvasWrapper({
  roomId,
  templateImportRequest,
}: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <CanvasErrorBoundary>
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
            <ClientSideSuspense
              fallback={
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Connecting to canvas...
                </div>
              }
            >
              <ReactFlowProvider>
                <CollaborativeCanvas
                  templateImportRequest={templateImportRequest}
                />
              </ReactFlowProvider>
            </ClientSideSuspense>
        </RoomProvider>
      </CanvasErrorBoundary>
    </LiveblocksProvider>
  );
}
