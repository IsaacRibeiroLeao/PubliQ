import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
}

export function Select({
  className,
  hint,
  id,
  label,
  name,
  options,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={selectId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        aria-describedby={hintId}
        className={`min-h-11 rounded-sm border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-signal focus:ring-2 focus:ring-signal/20 ${className ?? ""}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <span id={hintId} className="text-[13px] text-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
