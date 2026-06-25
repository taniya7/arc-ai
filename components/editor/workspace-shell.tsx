"use client";

import { useState } from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Share2,
  Sparkles,
  Link2,
  Layout,
  Bot,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useShareDialog } from "@/hooks/use-share-dialog";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/lib/projects";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  ownedProjects: ProjectItem[];
  sharedProjects: ProjectItem[];
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);

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

  const shareDialog = useShareDialog(projectId);

  const allProjects: ProjectItem[] = [...ownedProjects, ...sharedProjects];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ─── Workspace Navbar ─── */}
      <nav
        id="workspace-navbar"
        className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-4"
      >
        {/* Left section — toggle + project identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>

          {/* Project icon */}
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-elevated">
            <Layout className="size-3.5 text-muted-foreground" />
          </div>

          {/* Project name + workspace label */}
          <div className="flex flex-col">
            <span className="truncate text-sm font-semibold leading-tight text-foreground">
              {projectName}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              Workspace
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section — actions */}
        <div className="flex items-center gap-2">
          {/* Share button (outline style with label) */}
          <Button
            variant="outline"
            size="sm"
            aria-label="Share project"
            className="gap-1.5"
            onClick={shareDialog.open}
          >
            <Share2 className="size-3.5" />
            Share
          </Button>

          {/* AI toggle button (accent colored when open) */}
          <Button
            variant={aiSidebarOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setAiSidebarOpen((prev) => !prev)}
            aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className={cn(
              "gap-1.5",
              aiSidebarOpen &&
                "bg-brand text-primary-foreground hover:bg-brand/80"
            )}
          >
            <Sparkles className="size-3.5" />
            AI
          </Button>

          <UserButton />
        </div>
      </nav>

      {/* ─── Project Sidebar (left) ─── */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={allProjects}
        activeProjectId={projectId}
        onNewProject={openCreateDialog}
        onRename={openRenameDialog}
        onDelete={openDeleteDialog}
      />

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <main
          id="canvas-area"
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-base"
        >
          {/* Dot grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Subtle inner border effect */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-border/40" />

          {/* Centered workspace message */}
          <div className="relative z-10 flex max-w-md flex-col items-center gap-4 px-6 text-center">
            {/* Icon badge */}
            <div className="flex size-14 items-center justify-center rounded-full border border-brand/30 bg-brand/10">
              <Link2 className="size-6 text-brand" />
            </div>

            {/* Label */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Workspace Shell
            </p>

            {/* Heading */}
            <h1 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              Canvas and collaboration tooling land here next.
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              This room is ready for the shared architecture canvas, durable AI
              workflows, and real-time presence. For now, the shell is wired
              with project context and navigation only.
            </p>
          </div>
        </main>

        {/* ─── AI Sidebar (right) ─── */}
        {aiSidebarOpen && (
          <aside
            id="ai-sidebar"
            className="flex w-80 shrink-0 flex-col border-l border-border bg-surface"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-foreground">
                  AI Copilot
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Placeholder panel
                </span>
              </div>
              <Sparkles className="size-4 text-brand" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {/* Card — Chat surface pending */}
              <div className="rounded-xl border border-border bg-elevated p-4">
                <div className="mb-2 flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <Bot className="size-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Chat surface pending
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      The toggle is wired. Messaging and generation are
                      intentionally out of scope here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Spacer to push bottom card down */}
              <div className="flex-1" />

              {/* Card — Future hooks */}
              <div className="rounded-xl border border-border bg-elevated p-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Future Hooks
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Dialogs ─── */}

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

      <ShareDialog
        open={shareDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) shareDialog.close();
        }}
        isOwner={isOwner}
        owner={shareDialog.owner}
        collaborators={shareDialog.collaborators}
        isLoadingCollaborators={shareDialog.isLoadingCollaborators}
        inviteEmail={shareDialog.inviteEmail}
        onInviteEmailChange={shareDialog.setInviteEmail}
        isInviting={shareDialog.isInviting}
        inviteError={shareDialog.inviteError}
        onInvite={shareDialog.handleInvite}
        removingId={shareDialog.removingId}
        onRemove={shareDialog.handleRemove}
        copied={shareDialog.copied}
        onCopyLink={shareDialog.handleCopyLink}
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
