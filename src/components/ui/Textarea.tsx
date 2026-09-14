import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:ring-2 focus:ring-gold",
        className,
      )}
      {...props}
    />
  );
}
