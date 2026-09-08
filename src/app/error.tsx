"use client";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { PubliQLogo } from "@/components/PubliQLogo";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-lg">
        <PubliQLogo className="mb-8" />
        <ErrorState
          title="Não foi possível carregar esta etapa"
          description="Tente novamente. Se o problema continuar, volte à visão geral e retome o fluxo."
          action={<Button onClick={reset}>Tentar novamente</Button>}
        />
        {error.digest ? (
          <p className="mt-4 font-mono text-[13px] text-ink-muted">
            Referência: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
