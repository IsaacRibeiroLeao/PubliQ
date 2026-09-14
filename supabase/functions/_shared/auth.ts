import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getUserClient(req: Request): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !anon) {
    throw new Error("Chaves públicas do Supabase ausentes.");
  }
  const auth = req.headers.get("Authorization") ?? "";
  return createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUserId(req: Request) {
  const client = getUserClient(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error("unauthenticated");
  }
  return { userId: data.user.id, client };
}
