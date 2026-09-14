export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <span className="animate-orb absolute -top-24 -left-16 size-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold)_28%,transparent),transparent_68%)] blur-2xl" />
      <span className="animate-orb absolute top-1/3 -right-24 size-[32rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%)] blur-3xl [animation-delay:-8s]" />
      <span className="animate-orb absolute -bottom-28 left-1/3 size-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold)_18%,transparent),transparent_72%)] blur-2xl [animation-delay:-14s]" />
    </div>
  );
}
