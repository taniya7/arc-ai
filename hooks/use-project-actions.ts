"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ProjectItem } from "@/lib/projects";

// ---------- Types ----------

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: ProjectItem | null;
}

export interface UseProjectActionsReturn {
  // Dialog state
  dialogState: DialogState;
  openCreateDialog: () => void;
  openRenameDialog: (project: ProjectItem) => void;
  openDeleteDialog: (project: ProjectItem) => void;
  closeDialog: () => void;

  // Form state
  formName: string;
  setFormName: (name: string) => void;
  formSlug: string;

  // Loading state
  isLoading: boolean;

  // Actions (real API calls)
  handleCreate: () => void;
  handleRename: () => void;
  handleDelete: () => void;
}

// ---------- Helpers ----------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a short random suffix for room IDs. */
function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

// ---------- Hook ----------

export function useProjectActions(): UseProjectActionsReturn {
  const router = useRouter();

  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    project: null,
  });
  const [formName, setFormName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formSlug = toSlug(formName);

  // --- Open dialogs ---

  const openCreateDialog = useCallback(() => {
    setFormName("");
    setDialogState({ type: "create", project: null });
  }, []);

  const openRenameDialog = useCallback((project: ProjectItem) => {
    setFormName(project.name);
    setDialogState({ type: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: ProjectItem) => {
    setDialogState({ type: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, project: null });
    setFormName("");
    setIsLoading(false);
  }, []);

  // --- Real API actions ---

  const handleCreate = useCallback(async () => {
    const trimmed = formName.trim();
    if (!trimmed) return;
    setIsLoading(true);

    try {
      const slug = `${toSlug(trimmed)}-${shortId()}`;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const project = await res.json();

      // Close dialog and navigate to the new workspace.
      // The room ID is the project ID; slug kept for display.
      setDialogState({ type: null, project: null });
      setFormName("");
      setIsLoading(false);

      void slug; // slug available for Liveblocks room ID if needed later
      router.push(`/editor/${project.id}`);
    } catch {
      setIsLoading(false);
    }
  }, [formName, router]);

  const handleRename = useCallback(async () => {
    const trimmed = formName.trim();
    if (!trimmed || !dialogState.project) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${dialogState.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to rename project");

      setDialogState({ type: null, project: null });
      setFormName("");
      setIsLoading(false);

      router.refresh();
    } catch {
      setIsLoading(false);
    }
  }, [formName, dialogState.project, router]);

  const handleDelete = useCallback(async () => {
    if (!dialogState.project) return;
    setIsLoading(true);

    try {
      const deletedId = dialogState.project.id;

      const res = await fetch(`/api/projects/${deletedId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      setDialogState({ type: null, project: null });
      setIsLoading(false);

      // If we're currently viewing the deleted project, redirect home.
      if (window.location.pathname.includes(deletedId)) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch {
      setIsLoading(false);
    }
  }, [dialogState.project, router]);

  return {
    dialogState,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    formName,
    setFormName,
    formSlug,
    isLoading,
    handleCreate,
    handleRename,
    handleDelete,
  };
}
