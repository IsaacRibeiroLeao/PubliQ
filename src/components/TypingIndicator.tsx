export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-3xl border border-border bg-surface px-4 py-3" aria-live="polite">
      <span className="sr-only">Gerando roteiro</span>
      <span className="size-1.5 rounded-full bg-foreground [animation:pulse-dot_1.1s_ease-in-out_infinite]" />
      <span className="size-1.5 rounded-full bg-foreground [animation:pulse-dot_1.1s_ease-in-out_infinite] [animation-delay:160ms]" />
      <span className="size-1.5 rounded-full bg-foreground [animation:pulse-dot_1.1s_ease-in-out_infinite] [animation-delay:320ms]" />
    </div>
  );
}
