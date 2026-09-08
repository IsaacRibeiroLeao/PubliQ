import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { getSafeRedirectPath } from "@/modules/auth/redirect";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    "/dashboard",
  );

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(
    new URL(error ? "/login?error=callback" : redirectTo, request.url),
  );
}
