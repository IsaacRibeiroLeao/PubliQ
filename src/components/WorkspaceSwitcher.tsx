import { ChevronsUpDown } from "lucide-react";

export interface WorkspaceSwitcherProps {
  workspaceName: string;
}

export function WorkspaceSwitcher({
  workspaceName,
}: WorkspaceSwitcherProps) {
  return (
    <button
      type="button"
      aria-label={`Trocar workspace. Atual: ${workspaceName}`}
      className="flex w-full items-center gap-3 rounded-sm border border-border bg-surface px-3 py-2 text-left outline-none hover:bg-surface-inset focus-visible:ring-2 focus-visible:ring-signal"
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-signal font-display font-bold text-on-signal">
        P
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">
          {workspaceName}
        </span>
        <span className="block text-[13px] text-ink-muted">Workspace</span>
      </span>
      <ChevronsUpDown aria-hidden="true" size={16} className="text-ink-muted" />
    </button>
  );
}
