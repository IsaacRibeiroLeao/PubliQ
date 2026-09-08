export interface LoadingStateProps {
  label?: string;
  rows?: number;
}

export function LoadingState({
  label = "Carregando conteúdo",
  rows = 3,
}: LoadingStateProps) {
  return (
    <section aria-busy="true" aria-label={label} className="grid gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-md bg-surface-inset"
        />
      ))}
    </section>
  );
}
