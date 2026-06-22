"use client";

import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  return (
    <nav
      id="editor-navbar"
      className={cn(
        "flex h-12 shrink-0 items-center border-b border-border bg-surface px-3"
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>

      {/* Center section */}
      <div className="flex flex-1 items-center justify-center" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    </nav>
  );
}
