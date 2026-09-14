import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:ring-2 focus:ring-gold",
        className,
      )}
      {...props}
    />
  );
}
