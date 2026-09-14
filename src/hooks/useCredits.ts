"use client";

import { useCallback, useEffect, useState } from "react";
import type { UsageSnapshot } from "@/shared/schemas";
import { createClient } from "@/utils/supabase/client";

const EMPTY_USAGE: UsageSnapshot = {
  plan_tier: "STARTER",
  unlimited: false,
  prompts_used_today: 0,
  daily_prompt_limit: 3,
  remaining: 3,
  local_today: new Date().toISOString().slice(0, 10),
};

export function useCredits() {
  const [usage, setUsage] = useState<UsageSnapshot>(EMPTY_USAGE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_prompt_usage");
    if (!error && Array.isArray(data) && data[0]) {
      setUsage(data[0] as UsageSnapshot);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_prompt_usage").then(({ data, error }) => {
      if (!error && Array.isArray(data) && data[0]) {
        setUsage(data[0] as UsageSnapshot);
      }
      setLoading(false);
    });
  }, []);

  return { usage, loading, refresh };
}
