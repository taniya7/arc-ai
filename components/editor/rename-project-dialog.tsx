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

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  name: string;
  onNameChange: (name: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  currentName,
  name,
  onNameChange,
  isLoading,
  onSubmit,
}: RenameProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="rename-project-dialog">
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Rename <strong>{currentName}</strong> to a new name.
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
              htmlFor="rename-project-name"
              className="text-sm font-medium text-foreground"
            >
              New name
            </label>
            <Input
              ref={inputRef}
              id="rename-project-name"
              placeholder="Project name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
