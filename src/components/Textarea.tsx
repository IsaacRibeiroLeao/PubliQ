import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  className,
  error,
  hint,
  id,
  label,
  name,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? name ?? generatedId;
  const describedBy = [
    hint ? `${textareaId}-hint` : undefined,
    error ? `${textareaId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={textareaId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`min-h-28 resize-y rounded-sm border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-signal focus:ring-2 focus:ring-signal/20 ${error ? "border-critical" : "border-border"} ${className ?? ""}`.trim()}
        {...props}
      />
      {hint ? (
        <span id={`${textareaId}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${textareaId}-error`} className="text-[13px] text-critical">
          {error}
        </span>
      ) : null}
    </div>
  );
}
