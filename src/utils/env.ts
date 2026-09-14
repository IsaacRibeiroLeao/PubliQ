function missingPublicEnv(name: string): never {
  throw new Error(`Variável de ambiente ${name} não configurada.`);
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    missingPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!publishableKey) {
    missingPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return { url, publishableKey };
}
