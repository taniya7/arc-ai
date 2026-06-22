"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorHomeProps {
  onNewProject: () => void;
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <main
      id="editor-home"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6"
    >
      <h1 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
        Create a project or open an existing one
      </h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Start a new architecture workspace, or choose a project from the
        sidebar.
      </p>
      <Button className="mt-2 gap-2" onClick={onNewProject}>
        <Plus className="size-4" />
        New Project
      </Button>
    </main>
  );
}
