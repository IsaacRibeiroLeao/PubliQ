import { getServiceClient } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

const TIER_BY_PRICE: Record<string, "PRO" | "AGENCY"> = {
  [Deno.env.get("STRIPE_PRICE_PRO") ?? "price_pro"]: "PRO",
  [Deno.env.get("STRIPE_PRICE_AGENCY") ?? "price_agency"]: "AGENCY",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  const raw = await req.text();
  const stripeSignature = req.headers.get("stripe-signature");
  const asaasToken = req.headers.get("asaas-access-token");
  const service = getServiceClient();

  try {
    if (stripeSignature) {
      const event = JSON.parse(raw) as {
        id: string;
        type: string;
        data: { object: { customer?: string; client_reference_id?: string; metadata?: Record<string, string> } };
      };
      const userId = event.data.object.client_reference_id ?? event.data.object.metadata?.user_id;
      await service.from("billing_events").insert({
        user_id: userId ?? null,
        provider: "STRIPE",
        event_id: event.id,
        event_type: event.type,
        payload: event,
      });
      if (userId && event.type.startsWith("customer.subscription")) {
        const tier = (event.data.object.metadata?.tier as "PRO" | "AGENCY" | undefined) ?? "PRO";
        await service
          .from("profiles")
          .update({
            plan_tier: TIER_BY_PRICE[event.data.object.metadata?.price_id ?? ""] ?? tier,
            subscription_status: event.type.includes("deleted") ? "CANCELED" : "ACTIVE",
            billing_customer_id: event.data.object.customer ?? null,
          })
          .eq("id", userId);
      }
      return jsonResponse({ received: true });
    }

    if (asaasToken && asaasToken === Deno.env.get("ASAAS_WEBHOOK_TOKEN")) {
      const event = JSON.parse(raw) as { id?: string; event?: string; payment?: { customer?: string } };
      await service.from("billing_events").insert({
        provider: "ASAAS",
        event_id: event.id ?? crypto.randomUUID(),
        event_type: event.event ?? "unknown",
        payload: event,
      });
      return jsonResponse({ received: true });
    }

    return jsonResponse({ error: "Assinatura de webhook inválida." }, 401);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Erro interno" }, 400);
  }
});
