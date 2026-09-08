"use client";

import { ErrorState } from "@/components/ErrorState";

export interface BrandsErrorProps {
  reset: () => void;
}

export default function BrandsError({ reset }: BrandsErrorProps) {
  return (
    <ErrorState
      title="Não foi possível carregar as marcas"
      description="Verifique sua conexão e tente novamente."
      action={
        <button
          type="button"
          onClick={reset}
          className="min-h-10 rounded-sm bg-critical px-4 text-sm font-semibold text-white"
        >
          Tentar novamente
        </button>
      }
    />
  );
}
