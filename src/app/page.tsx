import { PubliQLogo } from "@/components/PubliQLogo";
import { getIntegrationMode, getIntegrationModeLabel } from "@/shared/integration-mode";

export default function HomePage() {
  const integrationMode = getIntegrationMode();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <PubliQLogo />
      <div className="max-w-md text-center">
        <h1 className="font-display text-[31px] font-semibold tracking-tight text-ink">
          Drop &amp; Publish
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Solte o criativo. A IA gera a copy. O cliente aprova. Publique — tudo
          numa esteira auditável.
        </p>
      </div>
      <p
        className="rounded-full bg-surface-inset px-4 py-1.5 font-mono text-[13px] text-ink-muted"
        data-testid="integration-mode-badge"
      >
        Modo: {getIntegrationModeLabel(integrationMode)}
      </p>
    </main>
  );
}
