import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/auth/session";
import { sanitizeMetaError } from "@/modules/meta/oauth";
import { getMetaOAuthWorkflow } from "@/modules/meta/workflow";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.redirect(
      new URL("/app/marcas?metaError=invalid_state", url.origin),
    );
  }

  try {
    const redirectUri = `${process.env.APP_URL ?? url.origin}/app/meta/callback`;
    const result = await (await getMetaOAuthWorkflow()).callback({
      userId: session.user.id,
      state,
      code,
      redirectUri,
    });
    return NextResponse.redirect(
      new URL(
        `/app/meta/selecionar?selection=${result.selectionId}`,
        url.origin,
      ),
    );
  } catch (error) {
    const returnUrl = new URL("/app/marcas", url.origin);
    returnUrl.searchParams.set("metaError", sanitizeMetaError(error));
    return NextResponse.redirect(returnUrl);
  }
}
