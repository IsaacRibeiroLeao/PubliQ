import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ action, description, title }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-md border border-critical/30 bg-critical-soft p-5"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 shrink-0 text-critical" size={20} />
        <div>
          <h2 className="font-semibold text-critical">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink">{description}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
