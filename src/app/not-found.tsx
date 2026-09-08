import { ArrowLeft } from "lucide-react";
import { PubliQLogo } from "@/components/PubliQLogo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <PubliQLogo className="mb-8 justify-center" />
        <p className="font-mono text-[13px] text-ember">404</p>
        <h1 className="mt-3 font-display text-[31px] font-semibold text-ink">
          Esta peça saiu da esteira
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A página não existe ou mudou de lugar. Volte à visão geral para
          continuar seu trabalho.
        </p>
        <a
          href="/app"
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-sm bg-signal px-4 py-2 text-sm font-semibold text-on-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Voltar à visão geral
        </a>
      </div>
    </main>
  );
}
