import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";

const PREVIEW = [
  { label: "0–3s", text: "Pare de postar todo dia sem um sistema." },
  { label: "4–45s", text: "Um roteiro claro, uma pauta e um horário. Só isso já muda o ritmo." },
  { label: "CTA", text: "Salve e grave amanhã. Constância vence improviso." },
];

export function LandingHero() {
  return (
    <div className="paper-grid relative min-h-screen overflow-hidden">
      <AmbientBackground />
      <header className="animate-fade-in relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark />
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </header>
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pt-6 pb-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="animate-fade-up text-sm tracking-[0.22em] text-muted uppercase">Estúdio de conteúdo para qualquer pessoa</p>
          <h1 className="animate-fade-up delay-1 mt-4 max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
            Publique com método. Sem agência, sem hype, sem perder o tom.
          </h1>
          <p className="animate-fade-up delay-2 mt-6 max-w-2xl text-lg text-muted">
            O ContentOS é um copiloto editorial: gera roteiros em 60 segundos, abre o teleprompter, agenda Reels e
            TikToks e acompanha o que performou — para criadores, negócios e marcas pessoais.
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">Começar agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
        </div>
        <aside className="animate-fade-up delay-4 hidden rounded-[2rem] border border-border bg-surface/80 p-6 shadow-[0_24px_80px_-40px_rgba(20,19,17,0.45)] backdrop-blur-sm lg:block">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Prévia do roteiro</p>
          <p className="mt-2 font-serif text-2xl">Um sistema simples para postar toda semana</p>
          <ol className="mt-5 space-y-3">
            {PREVIEW.map((item, index) => (
              <li
                key={item.label}
                className="animate-fade-up rounded-2xl border border-border bg-background/70 p-4"
                style={{ animationDelay: `${520 + index * 120}ms` }}
              >
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 text-sm leading-6">{item.text}</p>
              </li>
            ))}
          </ol>
        </aside>
      </main>
    </div>
  );
}
