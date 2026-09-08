"use server";

import { redirect } from "next/navigation";
import { requireSession, requireWorkspaceAccess } from "@/modules/auth/session";
import { sanitizeReturnPath } from "@/modules/meta/oauth";
import { getMetaConnectionService } from "@/modules/meta/service";
import { consumeMetaSelection } from "@/modules/meta/selection-store";
import {
  getMetaOAuthWorkflow,
  META_MANAGER_ROLES,
} from "@/modules/meta/workflow";
import { getBrandRepository } from "@/modules/brands/service";

export async function startMetaConnectionAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const returnTo = sanitizeReturnPath(String(formData.get("returnTo") ?? ""));
  const session = await requireSession();
  const redirectUri = `${process.env.APP_URL ?? "http://localhost:3000"}/app/meta/callback`;
  const authorizationUrl = await (await getMetaOAuthWorkflow()).start({
    userId: session.user.id,
    workspaceId,
    brandId,
    returnTo,
    redirectUri,
  });
  redirect(authorizationUrl);
}

export async function selectMetaAssetsAction(formData: FormData) {
  const selectionId = String(formData.get("selectionId") ?? "");
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const adAccountId = String(formData.get("adAccountId") ?? "") || null;
  const session = await requireSession();
  const selection = await consumeMetaSelection(selectionId, {
    userId: session.user.id,
    workspaceId,
    brandId,
  });
  if (!selection) {
    redirect("/app/marcas?metaError=expired");
  }
  await requireWorkspaceAccess(selection.workspaceId, META_MANAGER_ROLES);
  const brand = await (await getBrandRepository()).findById(
    selection.workspaceId,
    selection.brandId,
  );
  if (!brand) {
    redirect("/app/marcas?metaError=invalid_brand");
  }
  const asset = selection.assets.find((item) => item.pageId === pageId);
  if (!asset || (adAccountId && !asset.adAccountIds.includes(adAccountId))) {
    redirect(`${selection.returnTo}?metaError=invalid_asset`);
  }
  await (await getMetaConnectionService()).connect({
    workspaceId: selection.workspaceId,
    brandId: selection.brandId,
    accessToken: selection.grant.accessToken,
    expiresAt: selection.grant.expiresAt,
    scopes: selection.grant.scopes,
    pageId: asset.pageId,
    instagramAccountId: asset.instagramAccountId,
    adAccountId,
  });
  redirect(`${selection.returnTo}?meta=connected`);
}
