import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/utils/env";

export function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  return createBrowserClient(url, publishableKey);
}
