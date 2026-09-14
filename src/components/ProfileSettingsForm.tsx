"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Profile } from "@/types/database";
import { PROFESSIONS } from "@/utils/professions";
import { createClient } from "@/utils/supabase/client";

export interface ProfileSettingsFormProps {
  profile: Profile;
  onSaved: () => Promise<void>;
}

export function ProfileSettingsForm({ profile, onSaved }: ProfileSettingsFormProps) {
  const [name, setName] = useState(profile.name ?? "");
  const [profession, setProfession] = useState(profile.profession);
  const [niche, setNiche] = useState(profile.niche ?? "");
  const [timezone, setTimezone] = useState(profile.timezone);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name, profession, niche, timezone })
      .eq("id", profile.id);
    setStatus(error?.message ?? "Perfil atualizado.");
    await onSaved();
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-serif text-2xl">Seu perfil</h2>
      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" />
      <select
        className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
        value={profession}
        onChange={(event) => setProfession(event.target.value)}
      >
        {PROFESSIONS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.emoji} {item.label} · {item.group}
          </option>
        ))}
      </select>
      <Input value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="Nicho (ex.: finanças, culinária, moda)" />
      <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Fuso (America/Sao_Paulo)" />
      <Button type="button" onClick={() => void save()}>
        Salvar
      </Button>
      {status ? <p className="text-sm text-muted">{status}</p> : null}
    </Card>
  );
}
