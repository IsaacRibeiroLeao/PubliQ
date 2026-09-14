"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { CreditCounter } from "@/components/CreditCounter";
import { QuickPills } from "@/components/QuickPills";
import { ScriptCard } from "@/components/ScriptCard";
import { TeleprompterModal } from "@/components/TeleprompterModal";
import { TypingIndicator } from "@/components/TypingIndicator";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useChat } from "@/hooks/useChat";
import { useCredits } from "@/hooks/useCredits";
import { useProfile } from "@/hooks/useProfile";
import type { ContentScriptCard } from "@/shared/schemas";
import { createClient } from "@/utils/supabase/client";
import { isPaidPlan } from "@/utils/plans";
import { toISODate } from "@/utils/formatDate";

function extractScripts(payload: Record<string, unknown>): ContentScriptCard[] {
  const scripts = payload.scripts;
  if (!Array.isArray(scripts)) {
    return [];
  }
  return scripts as ContentScriptCard[];
}

export function ChatCopilot() {
  const router = useRouter();
  const { profile } = useProfile();
  const { usage, refresh } = useCredits();
  const { messages, sending, error, quotaExceeded, setQuotaExceeded, send } = useChat();
  const [draft, setDraft] = useState("");
  const [teleprompter, setTeleprompter] = useState<ContentScriptCard | null>(null);
  const paid = profile ? isPaidPlan(profile.plan_tier) : false;
  const today = toISODate(new Date());

  const submit = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        return;
      }
      setDraft("");
      await send({ prompt: trimmed, targetDate: today, scope: "day" });
      await refresh();
    },
    [refresh, send, today],
  );

  const addToCalendar = useCallback(async (script: ContentScriptCard) => {
    const supabase = createClient();
    await supabase.from("content_scripts").update({ status: "READY_TO_RECORD" }).eq("id", script.id);
  }, []);

  const openStudio = useCallback(
    (script: ContentScriptCard) => {
      router.push(`/studio?scriptId=${script.id}`);
    },
    [router],
  );

  const empty = messages.length === 0;
  const teleprompterText = useMemo(() => {
    if (!teleprompter) {
      return "";
    }
    return `${teleprompter.hookText}\n\n${teleprompter.bodyText}\n\n${teleprompter.ctaText}`;
  }, [teleprompter]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      <div className="flex items-center justify-between gap-3 px-1 py-3">
        <div>
          <p className="font-serif text-2xl">Copiloto</p>
          <p className="text-sm text-muted">Peça uma pauta. Eu devolvo roteiro, legendas e próximo passo.</p>
        </div>
        <CreditCounter usage={usage} />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {empty ? (
          <div className="flex min-h-[48vh] flex-col items-center justify-center gap-6 text-center">
            <h1 className="animate-fade-up max-w-xl font-serif text-4xl leading-tight">
              O que você quer publicar nesta semana?
            </h1>
            <QuickPills disabled={sending} onSelect={(prompt) => void submit(prompt)} />
          </div>
        ) : (
          messages.map((message) => {
            const scripts = extractScripts(message.payload);
            return (
              <ChatMessage key={message.id} role={message.role}>
                <div
                  className={
                    message.role === "user"
                      ? "rounded-3xl bg-accent px-4 py-3 text-sm text-accent-foreground"
                      : "space-y-4"
                  }
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  {scripts.map((script) => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      canAutoPost={paid}
                      onOpenTeleprompter={setTeleprompter}
                      onAddToCalendar={(item) => void addToCalendar(item)}
                      onUpload={openStudio}
                    />
                  ))}
                </div>
              </ChatMessage>
            );
          })
        )}
        {sending ? <TypingIndicator /> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>

      <form
        className="sticky bottom-0 space-y-3 bg-linear-to-t from-background via-background to-transparent pt-4 pb-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(draft);
        }}
      >
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ex.: Tenho uma cafeteria, gere um roteiro de 60s para terça sobre origem dos grãos..."
          disabled={sending}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={sending || draft.trim().length < 8}>
            {sending ? "Gerando..." : "Enviar"}
          </Button>
        </div>
      </form>

      <TeleprompterModal
        open={Boolean(teleprompter)}
        title={teleprompter?.title ?? "Teleprompter"}
        text={teleprompterText}
        onOpenChange={(open) => {
          if (!open) {
            setTeleprompter(null);
          }
        }}
      />
      <UpgradeModal open={quotaExceeded} onOpenChange={setQuotaExceeded} />
    </div>
  );
}
