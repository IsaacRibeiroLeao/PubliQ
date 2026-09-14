"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, ChatThread } from "@/types/database";
import type { ContentScriptCard, GenerateContentInput } from "@/shared/schemas";
import { invokeFunction } from "@/utils/invokeFunction";
import { createClient } from "@/utils/supabase/client";

export interface GenerateContentResponse {
  message: string;
  scripts: ContentScriptCard[];
  threadId: string;
  quotaExceeded?: boolean;
}

export function useChat() {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: threads } = await supabase
      .from("chat_threads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1);

    const current = (threads as ChatThread[] | null)?.[0];
    if (!current) {
      return;
    }

    setThread(current);
    const { data: history } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", current.id)
      .order("created_at", { ascending: true });
    setMessages((history as ChatMessage[] | null) ?? []);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("chat_threads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data: threads }) => {
        const current = (threads as ChatThread[] | null)?.[0];
        if (!current) {
          return;
        }
        setThread(current);
        void supabase
          .from("chat_messages")
          .select("*")
          .eq("thread_id", current.id)
          .order("created_at", { ascending: true })
          .then(({ data: history }) => {
            setMessages((history as ChatMessage[] | null) ?? []);
          });
      });
  }, []);

  const send = useCallback(
    async (input: GenerateContentInput) => {
      setSending(true);
      setError(null);
      setQuotaExceeded(false);

      const { data, error: invokeError, status } = await invokeFunction<GenerateContentResponse>("generate-content", {
        ...input,
        threadId: thread?.id,
      });

      if (status === 402 || data?.quotaExceeded) {
        setQuotaExceeded(true);
        setSending(false);
        return null;
      }

      if (invokeError || !data) {
        setError(invokeError ?? "Não foi possível gerar o conteúdo agora.");
        setSending(false);
        return null;
      }

      await load();
      setSending(false);
      return data;
    },
    [load, thread?.id],
  );

  return { thread, messages, sending, error, quotaExceeded, setQuotaExceeded, send, reload: load };
}
