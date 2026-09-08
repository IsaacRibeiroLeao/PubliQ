export interface ProgressProps {
  value: number;
  label: string;
  showValue?: boolean;
}

export function Progress({ label, showValue = false, value }: ProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="grid gap-2">
      {showValue ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-ink">{label}</span>
          <span className="font-mono text-[13px] text-ink-muted">
            {normalizedValue}%
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
        className="h-2 overflow-hidden rounded-full bg-surface-inset"
      >
        <div
          className="h-full rounded-full bg-signal transition-[width]"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
