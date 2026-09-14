"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface UseTeleprompterOptions {
  text: string;
  wordsPerMinute: number;
}

export function useTeleprompter({ text, wordsPerMinute }: UseTeleprompterOptions) {
  const [playing, setPlaying] = useState(false);
  const [offset, setOffset] = useState(0);

  const durationMs = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max((words / Math.max(wordsPerMinute, 40)) * 60_000, 8000);
  }, [text, wordsPerMinute]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - started) / durationMs, 1);
      setOffset(progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, durationMs]);

  const toggle = useCallback(() => {
    setPlaying((current) => !current);
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setOffset(0);
  }, []);

  return { playing, offset, toggle, reset, durationMs };
}
