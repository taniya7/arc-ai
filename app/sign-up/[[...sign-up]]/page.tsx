import { SignUp } from "@clerk/nextjs";
import { Cpu, Users, FileText } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel — visible on large screens only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-surface">
        {/* Logo — pinned to top */}
        <div className="flex items-center gap-2.5 px-12 pt-8">
          <div className="size-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-base font-semibold text-copy-primary tracking-tight">
            Arc AI
          </span>
        </div>

        {/* Content — vertically centered */}
        <div className="flex flex-1 flex-col justify-center px-12">
          <div className="max-w-md">
            {/* Tagline */}
            <h1 className="text-[2rem] leading-tight font-semibold text-copy-primary mb-4 tracking-tight">
              Design systems at the
              <br />
              speed of thought.
            </h1>
            <p className="text-copy-secondary text-[0.95rem] leading-relaxed mb-12">
              Describe your architecture in plain English. Arc AI maps it to
              nodes and edges on a live canvas your whole team can refine in
              real time.
            </p>

            {/* Feature list — icon + title + description */}
            <div className="space-y-6">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
                  <Cpu className="size-[18px] text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-copy-primary">
                    AI Architecture Generation
                  </p>
                  <p className="text-sm text-copy-muted leading-relaxed">
                    Describe your system, AI maps it to nodes and edges on a
                    live canvas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
                  <Users className="size-[18px] text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-copy-primary">
                    Real-time Collaboration
                  </p>
                  <p className="text-sm text-copy-muted leading-relaxed">
                    Live cursors, presence indicators, and shared node editing
                    across your team.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
                  <FileText className="size-[18px] text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-copy-primary">
                    Instant Spec Generation
                  </p>
                  <p className="text-sm text-copy-muted leading-relaxed">
                    Export a complete Markdown technical spec directly from the
                    canvas graph.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 pb-6">
          <p className="text-xs text-copy-faint">
            © 2026 Arc AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — Clerk form on base background */}
      <div className="flex flex-1 items-center justify-center bg-base p-6 lg:w-1/2">
        <SignUp />
      </div>
    </div>
  );
}
