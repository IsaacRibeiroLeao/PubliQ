"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/integrations/supabase/config";
import type { Database } from "@/shared/database.types";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicConfig();
  return createBrowserClient<Database>(url, anonKey);
}
