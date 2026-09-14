import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ChatMessageProps {
  role: "user" | "assistant";
  children: ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  return (
    <article
      className={cn(
        role === "user" ? "animate-slide-in-right ml-auto max-w-[80%]" : "animate-slide-in-left max-w-full",
      )}
    >
      {children}
    </article>
  );
}
