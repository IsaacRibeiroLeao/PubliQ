import type { ReactNode } from "react";
import { AppNavigation } from "@/components/AppNavigation";
import { ContextHeader } from "@/components/ContextHeader";
import { PubliQLogo } from "@/components/PubliQLogo";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

export interface AppShellProps {
  children: ReactNode;
  contextLabel: string;
  title: string;
  userName: string;
  workspaceName: string;
}

export function AppShell({
  children,
  contextLabel,
  title,
  userName,
  workspaceName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-surface p-4 md:flex md:flex-col">
        <PubliQLogo className="px-2 py-3" />
        <div className="mt-5">
          <WorkspaceSwitcher workspaceName={workspaceName} />
        </div>
        <div className="mt-6 flex-1">
          <AppNavigation />
        </div>
        <p className="border-t border-border px-3 pt-4 text-[13px] text-ink-muted">
          PubliQ MVP · modo demonstração
        </p>
      </aside>

      <div className="md:pl-64">
        <ContextHeader
          contextLabel={contextLabel}
          title={title}
          userName={userName}
        />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8">
          {children}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-2 py-1 md:hidden">
        <AppNavigation compact orientation="horizontal" />
      </div>
    </div>
  );
}
