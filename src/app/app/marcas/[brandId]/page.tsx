import { CheckCircle2, Link2Off, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/BrandForm";
import { Progress } from "@/components/Progress";
import { requireSession } from "@/modules/auth/session";
import { updateBrandAction } from "@/modules/brands/actions";
import {
  calculateBrandCompleteness,
  getBrandRepository,
  getPersonaDescription,
} from "@/modules/brands/service";
import { startMetaConnectionAction } from "@/modules/meta/actions";
import { getMetaConnectionRepository } from "@/modules/meta/service";

export interface BrandDetailPageProps {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ meta?: string; metaError?: string }>;
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandDetailPageProps) {
  const session = await requireSession();
  const membership = session.memberships[0];
  if (!membership) notFound();
  const { brandId } = await params;
  const repository = await getBrandRepository();
  const brand = await repository.findById(membership.workspaceId, brandId);
  if (!brand) notFound();

  const [recentCreatives, metaConnection] = await Promise.all([
    repository.listRecentCreatives(membership.workspaceId, brand.id),
    (await getMetaConnectionRepository()).getStatus(
      membership.workspaceId,
      brand.id,
    ),
  ]);
  const query = await searchParams;
  const canWrite = membership.role !== "VIEWER";
  const completeness = calculateBrandCompleteness(brand);
  const updateAction = updateBrandAction.bind(
    null,
    membership.workspaceId,
    brand.id,
  );

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-5 border-b border-border pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/app/marcas" className="text-sm font-semibold text-signal">
            Voltar para marcas
          </Link>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
            {brand.name}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">{brand.niche}</p>
        </div>
        <div className="w-full max-w-xs rounded-md border border-border bg-surface p-4">
          <div className="mb-3 flex justify-between text-sm">
            <span className="font-semibold text-ink">Perfil completo</span>
            <span className="font-mono font-semibold text-ink">
              {completeness}%
            </span>
          </div>
          <Progress value={completeness} label="Completude do perfil da marca" />
        </div>
      </header>

      {query.meta === "connected" ? (
        <p role="status" className="rounded-sm bg-success-soft p-3 text-sm text-success">
          Ativos Meta conectados com segurança.
        </p>
      ) : null}
      {query.metaError ? (
        <p role="alert" className="rounded-sm bg-critical-soft p-3 text-sm text-critical">
          Não foi possível concluir a conexão. Inicie o processo novamente.
        </p>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="profile-title">
          <h3 id="profile-title" className="mb-4 text-xl font-semibold text-ink">
            Perfil e brand voice
          </h3>
          {canWrite ? (
            <BrandForm
              action={updateAction}
              submitLabel="Salvar alterações"
              defaults={{
                name: brand.name,
                niche: brand.niche,
                valueProposition: brand.valueProposition,
                targetAudience: brand.targetAudience,
                persona: getPersonaDescription(brand),
                toneOfVoice: brand.toneOfVoice,
                voiceExamples: brand.voiceExamples,
                forbiddenWords: brand.forbiddenWords,
              }}
            />
          ) : (
            <dl className="grid gap-5 rounded-md border border-border bg-surface p-6">
              {[
                ["Proposta de valor", brand.valueProposition],
                ["Público-alvo", brand.targetAudience],
                ["Persona", getPersonaDescription(brand)],
                ["Tom de voz", brand.toneOfVoice],
                ["Exemplos de voz", brand.voiceExamples.join(" · ")],
                ["Palavras proibidas", brand.forbiddenWords.join(", ") || "Nenhuma"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold text-ink">{label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <aside className="grid content-start gap-6">
          <section className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-signal-soft text-signal">
                <Share2 aria-hidden="true" size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">Conexão Meta</h3>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {metaConnection
                    ? `Página ${metaConnection.pageId}`
                    : "Nenhuma página conectada"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm">
              {metaConnection?.status === "active" ? (
                <>
                  <CheckCircle2 className="text-success" size={18} />
                  <span className="font-semibold text-success">Ativa</span>
                </>
              ) : (
                <>
                  <Link2Off className="text-ink-muted" size={18} />
                  <span className="text-ink-muted">Desconectada</span>
                </>
              )}
            </div>
            {canWrite ? (
              <form action={startMetaConnectionAction} className="mt-5">
                <input
                  type="hidden"
                  name="workspaceId"
                  value={membership.workspaceId}
                />
                <input type="hidden" name="brandId" value={brand.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/app/marcas/${brand.id}`}
                />
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-inset"
                >
                  {metaConnection ? "Reconectar Meta" : "Conectar Meta"}
                </button>
              </form>
            ) : null}
          </section>

          <section className="rounded-md border border-border bg-surface p-5">
            <h3 className="font-semibold text-ink">Criativos recentes</h3>
            {recentCreatives.length ? (
              <ul className="mt-4 grid gap-4">
                {recentCreatives.map((creative) => (
                  <li key={creative.id} className="border-l-2 border-ember pl-3">
                    <p className="line-clamp-2 text-sm font-medium text-ink">
                      {creative.title}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {creative.status === "approved"
                        ? "Aprovado"
                        : creative.status === "changes_requested"
                          ? "Alterações solicitadas"
                          : "Aguardando aprovação"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                Nenhum criativo gerado para esta marca.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
