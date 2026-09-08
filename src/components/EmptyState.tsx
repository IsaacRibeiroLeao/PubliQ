import { ImagePlus } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <section className="grid justify-items-center rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-ember-soft text-ember">
        <ImagePlus aria-hidden="true" size={22} />
      </span>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
