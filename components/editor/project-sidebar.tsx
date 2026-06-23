"use client";

import { X, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/lib/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  onNewProject: () => void;
  onRename: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

// ---------- Project item with actions menu ----------

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: ProjectItem;
  onRename: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      className="group relative flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {project.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {project.id}
        </p>
      </div>

      {/* Actions — only for owned projects */}
      {project.isOwner && (
        <div className="relative shrink-0" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={`Actions for ${project.name}`}
            data-state={menuOpen ? "open" : "closed"}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              <button
                id={`rename-${project.id}`}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                onClick={() => {
                  setMenuOpen(false);
                  onRename(project);
                }}
              >
                <Pencil className="size-3.5 text-muted-foreground" />
                Rename
              </button>
              <button
                id={`delete-${project.id}`}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Sidebar ----------

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onNewProject,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);

  return (
    <>
      {/* Backdrop — click to close (mobile scrim) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="project-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden px-3 pt-3">
          <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="my-projects">
                {myProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No projects yet
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 py-2">
                    {myProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        onRename={onRename}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shared">
                {sharedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nothing shared with you
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 py-2">
                    {sharedProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        onRename={onRename}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer — New Project button */}
        <div className="shrink-0 border-t border-border p-3">
          <Button className="w-full gap-2" size="default" onClick={onNewProject}>
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
