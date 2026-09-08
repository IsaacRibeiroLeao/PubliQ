import { Camera } from "lucide-react";
import { Badge, type BadgeStatus } from "@/components/Badge";

export interface CreativeCardProps {
  brandName: string;
  channel: "Feed" | "Reels" | "Stories";
  title: string;
  status: BadgeStatus;
  accent: "signal" | "ember" | "success";
}

const accents = {
  signal: "bg-signal-soft text-signal",
  ember: "bg-ember-soft text-ember",
  success: "bg-success-soft text-success",
};

export function CreativeCard({
  accent,
  brandName,
  channel,
  status,
  title,
}: CreativeCardProps) {
  return (
    <article className="group min-w-0">
      <div
        className={`aspect-square overflow-hidden rounded-md border border-border ${accents[accent]} p-4`}
      >
        <div className="flex h-full flex-col justify-between">
          <Camera aria-hidden="true" size={20} />
          <p className="max-w-[12ch] font-display text-xl font-semibold leading-tight">
            {title}
          </p>
          <span className="text-[13px] font-semibold">{brandName}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] text-ink-muted">{channel}</span>
        <Badge status={status} />
      </div>
    </article>
  );
}
