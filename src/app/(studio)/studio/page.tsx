import { Suspense } from "react";
import { UploadStudio } from "@/components/UploadStudio";

export default function StudioPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando estúdio...</p>}>
      <UploadStudio />
    </Suspense>
  );
}
