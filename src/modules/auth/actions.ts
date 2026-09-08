"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { getSafeRedirectPath } from "@/modules/auth/redirect";
import { getIntegrationMode } from "@/shared/integration-mode";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  redirectTo: z.string().optional(),
});

export interface LoginActionResult {
  error: string;
}

export async function login(
  formData: FormData,
): Promise<LoginActionResult | never> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") || undefined,
  });

  if (!parsed.success) {
    return { error: "Informe um e-mail e uma senha válidos." };
  }

  const redirectTo = getSafeRedirectPath(
    parsed.data.redirectTo,
    "/dashboard",
  );

  if (getIntegrationMode() === "mock") {
    redirect(redirectTo);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Não foi possível autenticar com essas credenciais." };
  }

  redirect(redirectTo);
}

export async function logout(): Promise<never> {
  if (getIntegrationMode() === "real") {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
