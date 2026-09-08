import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MessageSquareCheck,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { CreativeCard } from "@/components/CreativeCard";
import { Progress } from "@/components/Progress";
import type { Brand, Profile } from "@/shared/domain";

export interface DashboardProps {
  user: Profile;
  brand: Brand;
}

const pipelineStages = [
  {
    label: "Upload",
    detail: "3 arquivos recebidos",
    count: "03",
    icon: UploadCloud,
    state: "done",
  },
  {
    label: "Análise",
    detail: "2 copies sendo geradas",
    count: "02",
    icon: Sparkles,
    state: "active",
  },
  {
    label: "Aprovação",
    detail: "4 aguardam o cliente",
    count: "04",
    icon: MessageSquareCheck,
    state: "waiting",
  },
  {
    label: "Publicação",
    detail: "8 agendadas esta semana",
    count: "08",
    icon: Send,
    state: "idle",
  },
] as const;

export function Dashboard({ brand, user }: DashboardProps) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="grid gap-8">
      <section className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-[31px] font-semibold tracking-tight text-ink">
            Olá, {firstName}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Sua esteira está em movimento. Há quatro peças esperando aprovação
            antes das publicações de amanhã.
          </p>
        </div>
        <Link
          href="/app/marcas/nova"
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-sm bg-signal px-4 py-2 text-sm font-semibold text-on-signal sm:self-auto"
        >
          <UploadCloud aria-hidden="true" size={18} />
          Nova marca
        </Link>
      </section>

      <section aria-labelledby="pipeline-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="pipeline-title" className="text-xl font-semibold text-ink">
              Esteira de publicação
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Do arquivo recebido ao conteúdo no ar.
            </p>
          </div>
          <Link
            href="/app/marcas"
            className="hidden items-center gap-1 text-sm font-semibold text-signal outline-none focus-visible:ring-2 focus-visible:ring-signal sm:flex"
          >
            Ver marcas <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <ol className="grid overflow-hidden rounded-md border border-border bg-surface md:grid-cols-4">
          {pipelineStages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <li
                key={stage.label}
                aria-label={`Etapa ${index + 1}: ${stage.label}`}
                className={`relative min-h-44 border-b border-border p-5 last:border-0 md:border-b-0 md:border-r ${
                  stage.state === "active" ? "bg-signal-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-sm ${
                      stage.state === "active"
                        ? "bg-signal text-on-signal"
                        : stage.state === "waiting"
                          ? "bg-warning-soft text-warning"
                          : "bg-surface-inset text-ink-muted"
                    }`}
                  >
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <span className="font-mono text-[25px] font-semibold text-ink">
                    {stage.count}
                  </span>
                </div>
                <h3 className="mt-6 font-semibold text-ink">{stage.label}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  {stage.detail}
                </p>
                {index < pipelineStages.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 rotate-45 border-r border-t border-border bg-surface md:block"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="recent-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="recent-title" className="text-xl font-semibold text-ink">
              Criativos recentes
            </h2>
            <Link
              href={`/app/marcas/${brand.id}`}
              className="text-sm font-semibold text-signal"
            >
              Abrir marca
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <CreativeCard
              brandName={brand.name}
              channel="Feed"
              title="Café de origem, sem complicação."
              status="Aguardando aprovação"
              accent="ember"
            />
            <CreativeCard
              brandName="Estúdio Norte"
              channel="Reels"
              title="Um espaço para criar."
              status="Em análise"
              accent="signal"
            />
            <CreativeCard
              brandName="Verde Lar"
              channel="Stories"
              title="Casa viva em cada detalhe."
              status="Publicado"
              accent="success"
            />
          </div>
        </section>

        <aside className="grid content-start gap-6">
          <section className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">Cota mensal</h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Renova em 12 dias
                </p>
              </div>
              <span className="font-mono text-xl font-semibold text-ink">68%</span>
            </div>
            <div className="mt-5">
              <Progress value={68} label="Uso da cota mensal" />
            </div>
            <p className="mt-3 text-[13px] text-ink-muted">
              34 de 50 publicações
            </p>
          </section>

          <section className="border-l-2 border-ember pl-5">
            <h2 className="font-semibold text-ink">Atividade e alertas</h2>
            <ul className="mt-4 grid gap-4">
              <li className="flex gap-3">
                <Clock3 className="mt-0.5 shrink-0 text-warning" size={18} />
                <p className="text-sm text-ink">
                  <strong className="font-semibold">4 aprovações</strong>
                  <span className="block text-[13px] text-ink-muted">
                    aguardam resposta do cliente
                  </span>
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-success"
                  size={18}
                />
                <p className="text-sm text-ink">
                  <strong className="font-semibold">Café Aurora publicado</strong>
                  <span className="block text-[13px] text-ink-muted">
                    Instagram Feed · há 28 min
                  </span>
                </p>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
