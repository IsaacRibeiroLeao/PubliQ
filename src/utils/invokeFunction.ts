import { createClient } from "@/utils/supabase/client";

export async function invokeFunction<TResponse>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data: TResponse | null; error: string | null; status: number }> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    const context = error as { message?: string; context?: Response };
    let message = context.message ?? "Falha ao chamar a função.";
    let status = 500;

    if (context.context) {
      status = context.context.status;
      try {
        const payload = (await context.context.json()) as { error?: string; message?: string };
        message = payload.error ?? payload.message ?? message;
      } catch {
        message = context.message ?? message;
      }
    }

    return { data: null, error: message, status };
  }

  return { data: data as TResponse, error: null, status: 200 };
}
