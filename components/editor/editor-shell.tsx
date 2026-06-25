"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectItem } from "@/lib/projects";

interface EditorShellProps {
  ownedProjects: ProjectItem[];
  sharedProjects: ProjectItem[];
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
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
  } = useProjectActions();

  const allProjects: ProjectItem[] = [...ownedProjects, ...sharedProjects];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={allProjects}
        onNewProject={openCreateDialog}
        onRename={openRenameDialog}
        onDelete={openDeleteDialog}
      />

      {/* Editor home — shown when no project is selected */}
      <EditorHome onNewProject={openCreateDialog} />

      {/* --- Dialogs --- */}

      <CreateProjectDialog
        open={dialogState.type === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        name={formName}
        onNameChange={setFormName}
        slug={formSlug}
        isLoading={isLoading}
        onSubmit={handleCreate}
      />

      <RenameProjectDialog
        open={dialogState.type === "rename"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        currentName={dialogState.project?.name ?? ""}
        name={formName}
        onNameChange={setFormName}
        isLoading={isLoading}
        onSubmit={handleRename}
      />

      <DeleteProjectDialog
        open={dialogState.type === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        projectName={dialogState.project?.name ?? ""}
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
