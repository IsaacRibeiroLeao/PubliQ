import { requireUserId } from "../_shared/auth.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    await requireUserId(req);
    const body = (await req.json()) as { tier?: string; provider?: string };
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const asaasKey = Deno.env.get("ASAAS_API_KEY");

    if (body.provider === "STRIPE" && stripeKey) {
      const price = body.tier === "AGENCY" ? Deno.env.get("STRIPE_PRICE_AGENCY") : Deno.env.get("STRIPE_PRICE_PRO");
      const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "http://127.0.0.1:3000";
      const session = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: "subscription",
          success_url: `${origin}/settings?checkout=ok`,
          cancel_url: `${origin}/pricing`,
          "line_items[0][price]": price ?? "",
          "line_items[0][quantity]": "1",
        }),
      });
      const json = (await session.json()) as { url?: string; error?: { message: string } };
      if (json.url) {
        return jsonResponse({ url: json.url });
      }
      return jsonResponse({ message: json.error?.message ?? "Não foi possível abrir o Stripe." }, 400);
    }

    if (body.provider === "ASAAS" && asaasKey) {
      return jsonResponse({
        message: "Asaas configurado. Crie o cliente e a assinatura no painel ou complete o payload de /v3/subscriptions.",
      });
    }

    return jsonResponse({
      message: "Checkout ainda sem chaves. Defina STRIPE_SECRET_KEY/ASAAS_API_KEY nos secrets das Edge Functions.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return jsonResponse({ error: message }, message === "unauthenticated" ? 401 : 500);
  }
});
