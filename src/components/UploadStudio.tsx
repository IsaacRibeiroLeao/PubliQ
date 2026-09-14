"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useProfile } from "@/hooks/useProfile";
import type { ContentScript } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { isPaidPlan } from "@/utils/plans";
import { invokeFunction } from "@/utils/invokeFunction";

export function UploadStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const { profile } = useProfile();
  const scriptId = params.get("scriptId");
  const [script, setScript] = useState<ContentScript | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const paid = profile ? isPaidPlan(profile.plan_tier) : false;

  useEffect(() => {
    if (!scriptId) {
      return;
    }
    const supabase = createClient();
    void supabase
      .from("content_scripts")
      .select("*")
      .eq("id", scriptId)
      .single()
      .then(({ data }) => setScript((data as ContentScript | null) ?? null));
  }, [scriptId]);

  const submit = useCallback(async () => {
    if (!file || !script || !scheduledFor) {
      setStatus("Selecione o vídeo, a pauta e o horário.");
      return;
    }
    if (!paid) {
      router.push("/pricing");
      return;
    }

    const supabase = createClient();
    const path = `${profile?.id}/${script.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from("media-raw").upload(path, file, { upsert: true });
    if (uploadError) {
      setStatus(uploadError.message);
      return;
    }

    const { error } = await invokeFunction("queue-publish", {
      scriptId: script.id,
      mediaPath: path,
      scheduledFor: new Date(scheduledFor).toISOString(),
      platforms: ["INSTAGRAM", "TIKTOK"],
    });

    setStatus(error ?? "Vídeo na fila de publicação.");
  }, [file, paid, profile?.id, router, scheduledFor, script]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-4xl">Estúdio de publicação</h1>
        <p className="text-muted">Envie o Reel e agende Instagram + TikTok pelas APIs oficiais.</p>
      </div>
      <Card className="space-y-4">
        <p className="font-medium">{script?.title ?? "Selecione uma pauta pelo copiloto."}</p>
        <Input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <Input type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
        <Button type="button" onClick={() => void submit()} disabled={!paid}>
          {paid ? "Agendar auto-post" : "Disponível no Pro"}
        </Button>
        {status ? <p className="text-sm text-muted">{status}</p> : null}
      </Card>
    </div>
  );
}
