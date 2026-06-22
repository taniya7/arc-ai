"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  slug: string;
  isLoading: boolean;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  slug,
  isLoading,
  onSubmit,
}: CreateProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Small delay to ensure dialog has rendered
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="create-project-dialog">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-project-name"
              className="text-sm font-medium text-foreground"
            >
              Project name
            </label>
            <Input
              ref={inputRef}
              id="create-project-name"
              placeholder="My new project"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {slug && (
            <p className="text-xs text-muted-foreground">
              Slug:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                {slug}
              </code>
            </p>
          )}

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
