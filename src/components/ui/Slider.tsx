"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/utils/cn";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export function Slider({ value, min = 1, max = 100, step = 1, onValueChange, className }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-6 w-full touch-none items-center", className)}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={(next) => onValueChange(next[0] ?? value)}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-surface-2">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full border border-accent bg-surface shadow" />
    </SliderPrimitive.Root>
  );
}
