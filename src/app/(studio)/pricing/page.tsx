import { PlanBillingCard } from "@/components/PlanBillingCard";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Planos</h1>
        <p className="text-muted">Starter gratuito. Pro e Agency desbloqueiam publicação e métricas.</p>
      </div>
      <PlanBillingCard />
    </div>
  );
}
