import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

const variants = {
  primary: "bg-signal text-on-signal hover:opacity-90",
  secondary:
    "border border-border bg-surface text-ink hover:bg-surface-inset",
  ghost: "text-ink-muted hover:bg-surface-inset hover:text-ink",
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
