import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/utils/env";

const PROTECTED_PREFIXES = ["/chat", "/calendar", "/studio", "/analytics", "/settings", "/pricing"];

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  try {
    const { data } = await supabase.auth.getClaims();
    const isAuthenticated = Boolean(data?.claims);
    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (isProtected && !isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname === "/login" && isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/chat";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch {
    return response;
  }
}
