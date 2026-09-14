import { PlanBillingCard } from "@/components/PlanBillingCard";
import { ProfileSettings } from "@/components/ProfileSettings";
import { SocialAccountsPanel } from "@/components/SocialAccountsPanel";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Conta</h1>
        <p className="text-muted">Área de atuação, fuso horário e conexões oficiais.</p>
      </div>
      <ProfileSettings />
      <SocialAccountsPanel />
      <PlanBillingCard />
    </div>
  );
}
