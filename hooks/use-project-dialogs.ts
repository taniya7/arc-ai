"use client";

import { useState, useCallback } from "react";

// ---------- Types ----------

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
  updatedAt: string;
}

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: Project | null;
}

interface UseProjectDialogsReturn {
  // Projects
  projects: Project[];

  // Dialog state
  dialogState: DialogState;
  openCreateDialog: () => void;
  openRenameDialog: (project: Project) => void;
  openDeleteDialog: (project: Project) => void;
  closeDialog: () => void;

  // Form state
  formName: string;
  setFormName: (name: string) => void;
  formSlug: string;

  // Loading state
  isLoading: boolean;

  // Actions
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

// ---------- Mock data ----------

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "E-Commerce Platform",
    slug: "e-commerce-platform",
    isOwner: true,
    updatedAt: "2026-06-20T10:30:00Z",
  },
  {
    id: "proj_2",
    name: "Mobile App Backend",
    slug: "mobile-app-backend",
    isOwner: true,
    updatedAt: "2026-06-19T14:00:00Z",
  },
  {
    id: "proj_3",
    name: "Design System",
    slug: "design-system",
    isOwner: false,
    updatedAt: "2026-06-18T09:15:00Z",
  },
  {
    id: "proj_4",
    name: "Analytics Dashboard",
    slug: "analytics-dashboard",
    isOwner: false,
    updatedAt: "2026-06-17T16:45:00Z",
  },
];

// ---------- Hook ----------

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
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

  const openRenameDialog = useCallback((project: Project) => {
    setFormName(project.name);
    setDialogState({ type: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: Project) => {
    setDialogState({ type: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, project: null });
    setFormName("");
    setIsLoading(false);
  }, []);

  // --- Mock actions ---

  const handleCreate = useCallback(() => {
    if (!formName.trim()) return;
    setIsLoading(true);

    // Simulate delay
    setTimeout(() => {
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: formName.trim(),
        slug: toSlug(formName),
        isOwner: true,
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
      setDialogState({ type: null, project: null });
      setFormName("");
      setIsLoading(false);
    }, 400);
  }, [formName]);

  const handleRename = useCallback(() => {
    if (!formName.trim() || !dialogState.project) return;
    setIsLoading(true);

    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === dialogState.project!.id
            ? { ...p, name: formName.trim(), slug: toSlug(formName) }
            : p
        )
      );
      setDialogState({ type: null, project: null });
      setFormName("");
      setIsLoading(false);
    }, 400);
  }, [formName, dialogState.project]);

  const handleDelete = useCallback(() => {
    if (!dialogState.project) return;
    setIsLoading(true);

    setTimeout(() => {
      setProjects((prev) =>
        prev.filter((p) => p.id !== dialogState.project!.id)
      );
      setDialogState({ type: null, project: null });
      setIsLoading(false);
    }, 400);
  }, [dialogState.project]);

  return {
    projects,
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
