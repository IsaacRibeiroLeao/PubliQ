"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useProfile } from "@/hooks/useProfile";
import type { SocialAccount } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { isPaidPlan } from "@/utils/plans";

export function SocialAccountsPanel() {
  const { profile } = useProfile();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const paid = profile ? isPaidPlan(profile.plan_tier) : false;

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("social_accounts")
      .select("id, user_id, platform, account_id, account_name, token_expires_at, connected_at")
      .then(({ data }) => setAccounts((data as SocialAccount[] | null) ?? []));
  }, []);

  async function connect(platform: "INSTAGRAM" | "TIKTOK") {
    const supabase = createClient();
    const { data } = await supabase.functions.invoke("connect-social", { body: { platform } });
    const url = (data as { url?: string } | null)?.url;
    if (url) {
      window.location.assign(url);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-serif text-2xl">Contas conectadas</h2>
      <p className="text-sm text-muted">
        Tokens ficam no schema privado. O app só vê nome da conta e plataforma.
      </p>
      {accounts.map((account) => (
        <p key={account.id} className="text-sm">
          {account.platform}: {account.account_name ?? account.account_id}
        </p>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!paid} onClick={() => void connect("INSTAGRAM")}>
          Conectar Instagram
        </Button>
        <Button type="button" variant="outline" disabled={!paid} onClick={() => void connect("TIKTOK")}>
          Conectar TikTok
        </Button>
      </div>
    </Card>
  );
}
