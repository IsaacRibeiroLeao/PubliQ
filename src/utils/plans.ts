export const PLAN_TIERS = ["STARTER", "PRO", "AGENCY"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  priceLabel: string;
  monthlyPriceCents: number;
  tagline: string;
  features: string[];
  dailyPromptLimit: number | null;
  maxGenerationDays: number;
  maxAccountsPerPlatform: number;
  autoPost: boolean;
  analytics: boolean;
  teleprompter: boolean;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  STARTER: {
    tier: "STARTER",
    name: "Starter",
    priceLabel: "R$ 0",
    monthlyPriceCents: 0,
    tagline: "3 prompts por dia, um dia de pauta por vez.",
    features: [
      "3 créditos diários de geração",
      "1 dia de conteúdo por requisição",
      "Cópia manual de roteiros e legendas",
      "Filtro de tom e promessas",
    ],
    dailyPromptLimit: 3,
    maxGenerationDays: 1,
    maxAccountsPerPlatform: 0,
    autoPost: false,
    analytics: false,
    teleprompter: false,
  },
  PRO: {
    tier: "PRO",
    name: "Pro",
    priceLabel: "R$ 97",
    monthlyPriceCents: 9700,
    tagline: "Sua operação de conteúdo no automático.",
    features: [
      "Prompts ilimitados",
      "Geração semanal e mensal em 1 clique",
      "1 Instagram + 1 TikTok",
      "Auto-post agendado",
      "Teleprompter e dashboard com IA",
    ],
    dailyPromptLimit: null,
    maxGenerationDays: 31,
    maxAccountsPerPlatform: 1,
    autoPost: true,
    analytics: true,
    teleprompter: true,
  },
  AGENCY: {
    tier: "AGENCY",
    name: "Agency",
    priceLabel: "R$ 247",
    monthlyPriceCents: 24700,
    tagline: "Até 5 contas por rede, relatórios e suporte prioritário.",
    features: [
      "Tudo do Pro",
      "Até 5 contas Instagram e 5 TikTok",
      "Relatórios consolidados em PDF",
      "Suporte prioritário",
    ],
    dailyPromptLimit: null,
    maxGenerationDays: 31,
    maxAccountsPerPlatform: 5,
    autoPost: true,
    analytics: true,
    teleprompter: true,
  },
};

export function isPaidPlan(tier: PlanTier) {
  return tier === "PRO" || tier === "AGENCY";
}
