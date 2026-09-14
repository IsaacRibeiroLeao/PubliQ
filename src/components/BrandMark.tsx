import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-500 hover:rotate-12">
        <Sparkles className="size-4" />
      </span>
      <span className="font-serif text-xl tracking-tight">ContentOS</span>
    </div>
  );
}
