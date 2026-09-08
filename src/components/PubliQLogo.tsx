export interface PubliQLogoProps {
  className?: string;
}

export function PubliQLogo({ className }: PubliQLogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className ?? ""}`.trim()}
      aria-label="PubliQ"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="4"
          y="8"
          width="24"
          height="24"
          rx="4"
          stroke="var(--signal)"
          strokeWidth="2.5"
        />
        <path
          d="M28 8 L36 4 L32 12 Z"
          fill="var(--ember)"
        />
        <rect x="10" y="14" width="12" height="8" rx="1" fill="var(--signal-soft)" />
      </svg>
      <span className="font-display text-[25px] font-bold tracking-tight text-ink">
        PubliQ
      </span>
    </div>
  );
}
