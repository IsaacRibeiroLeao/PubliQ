import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { requireSession, requireWorkspaceAccess } from "@/modules/auth/session";
import { selectMetaAssetsAction } from "@/modules/meta/actions";
import { getMetaSelection } from "@/modules/meta/selection-store";
import { META_MANAGER_ROLES } from "@/modules/meta/workflow";

export const metadata: Metadata = {
  title: "Selecionar ativos Meta | PubliQ",
};

export interface MetaAssetSelectionPageProps {
  searchParams: Promise<{ selection?: string }>;
}

export default async function MetaAssetSelectionPage({
  searchParams,
}: MetaAssetSelectionPageProps) {
  const session = await requireSession();
  const selectionId = (await searchParams).selection;
  const selection = selectionId
    ? await getMetaSelection(selectionId, {
        userId: session.user.id,
        workspaceIds: session.memberships.map(
          (membership) => membership.workspaceId,
        ),
      })
    : null;
  if (!selection) notFound();
  await requireWorkspaceAccess(selection.workspaceId, META_MANAGER_ROLES);

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Escolha os ativos da Meta
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Selecione a página que a PubliQ poderá usar. O token permanece somente
          no servidor durante esta etapa.
        </p>
      </header>

      {selection.assets.length === 0 ? (
        <EmptyState
          title="Nenhum ativo Meta disponível"
          description="A conta conectada não liberou páginas. Revise as permissões na Meta e tente conectar novamente."
          action={
            <Link
              href={`/app/marcas/${selection.brandId}`}
              className="inline-flex min-h-10 items-center rounded-sm bg-signal px-4 text-sm font-semibold text-on-signal"
            >
              Voltar para a marca
            </Link>
          }
        />
      ) : (
      <form action={selectMetaAssetsAction} className="grid gap-5">
        <input type="hidden" name="selectionId" value={selection.id} />
        <input type="hidden" name="workspaceId" value={selection.workspaceId} />
        <input type="hidden" name="brandId" value={selection.brandId} />
        <fieldset className="grid gap-3">
          <legend className="mb-2 font-semibold text-ink">Página e Instagram</legend>
          {selection.assets.map((asset, index) => (
            <label
              key={asset.pageId}
              className="flex cursor-pointer gap-3 rounded-md border border-border bg-surface p-4 has-[:checked]:border-signal has-[:checked]:bg-signal-soft"
            >
              <input
                type="radio"
                name="pageId"
                value={asset.pageId}
                defaultChecked={index === 0}
                required
              />
              <span>
                <strong className="block text-sm text-ink">{asset.pageName}</strong>
                <span className="text-[13px] text-ink-muted">
                  {asset.instagramAccountName
                    ? `Instagram ${asset.instagramAccountName}`
                    : "Sem Instagram Business vinculado"}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {selection.assets[0]?.adAccountIds.length ? (
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Conta de anúncios
            <select
              name="adAccountId"
              className="min-h-11 rounded-sm border border-border bg-surface px-3 font-normal"
            >
              <option value="">Não conectar agora</option>
              {selection.assets.flatMap((asset) =>
                asset.adAccountIds.map((accountId) => (
                  <option key={accountId} value={accountId}>
                    {accountId}
                  </option>
                )),
              )}
            </select>
          </label>
        ) : null}

        <Button type="submit">Confirmar ativos</Button>
      </form>
      )}
    </div>
  );
}
