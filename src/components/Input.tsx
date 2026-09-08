import type { InputHTMLAttributes } from "react";
import { useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Input({
  className,
  error,
  hint,
  id,
  label,
  name,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 rounded-sm border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-signal focus:ring-2 focus:ring-signal/20 ${error ? "border-critical" : "border-border"} ${className ?? ""}`.trim()}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="text-[13px] text-ink-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-[13px] font-medium text-critical">
          {error}
        </span>
      ) : null}
    </div>
  );
}
