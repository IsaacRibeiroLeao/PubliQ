import { CircleCheck, Workflow } from "lucide-react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { PubliQLogo } from "@/components/PubliQLogo";
import { getSafeRedirectPath } from "@/modules/auth/redirect";

export const metadata: Metadata = {
  title: "Entrar | PubliQ",
  description: "Acesse o workspace da sua agência no PubliQ.",
};

export interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedRedirect =
    typeof params.redirectTo === "string" ? params.redirectTo : undefined;
  const redirectTo = getSafeRedirectPath(requestedRedirect, "/app");

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]">
      <section className="hidden border-r border-border bg-signal-soft p-12 lg:flex lg:flex-col lg:justify-between">
        <PubliQLogo />
        <div className="max-w-xl">
          <Workflow aria-hidden="true" size={32} className="mb-6 text-signal" />
          <h1 className="font-display text-[39px] font-semibold leading-tight text-ink">
            Uma esteira clara entre o criativo e a publicação.
          </h1>
          <ul className="mt-8 grid gap-4 text-sm text-ink-muted">
            <li className="flex items-center gap-3">
              <CircleCheck aria-hidden="true" size={18} className="text-success" />
              Acompanhe análise, aprovação e publicação
            </li>
            <li className="flex items-center gap-3">
              <CircleCheck aria-hidden="true" size={18} className="text-success" />
              Trabalhe com dados demonstrativos no modo mock
            </li>
          </ul>
        </div>
        <p className="text-[13px] text-ink-muted">
          Drop &amp; Publish, sem etapas escondidas.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <PubliQLogo className="mb-10 lg:hidden" />
          <h2 className="font-display text-[31px] font-semibold text-ink">
            Entre no PubliQ
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Use suas credenciais para continuar no workspace da agência.
          </p>
          <LoginForm redirectTo={redirectTo} />
          <p className="mt-6 text-center text-[13px] text-ink-muted">
            Primeiro acesso?{" "}
            <a className="font-semibold text-signal" href="/onboarding">
              Configure seu workspace
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
