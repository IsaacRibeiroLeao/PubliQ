import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("rounded-3xl border border-border bg-surface p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5", className)} {...props} />;
}
