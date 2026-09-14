export interface GeneratedScript {
  title: string;
  hookText: string;
  bodyText: string;
  ctaText: string;
  instagramCaption: string;
  tiktokCaption: string;
  ethicalTheme: string;
  ethicalFraming: string;
  compliancePassed: boolean;
  complianceNotes: string;
  targetDate: string;
}

export interface ProfileRow {
  id: string;
  name: string | null;
  profession: string;
  niche: string | null;
  plan_tier: "STARTER" | "PRO" | "AGENCY";
  timezone: string;
}

export interface ComplianceRule {
  code: string;
  title: string;
  instruction: string;
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function framingLabel(profession: string) {
  if (profession === "advogado") {
    return "OAB";
  }
  if (profession === "medico") {
    return "CFM";
  }
  return "conteúdo responsável";
}

function fallbackScript(input: {
  prompt: string;
  profession: string;
  niche: string | null;
  targetDate: string;
  rules: ComplianceRule[];
}): GeneratedScript {
  const theme = input.niche ? `${input.profession} · ${input.niche}` : input.profession;
  return {
    title: `Pauta da semana: ${theme}`,
    hookText: `Se você cria conteúdo${input.niche ? ` sobre ${input.niche}` : ""}, este é o erro que mais atrasa resultado — e não existe fórmula mágica.`,
    bodyText: `Vamos por partes: (1) o que a maioria mistura; (2) o critério que realmente importa; (3) o próximo passo simples. Pedido original: ${input.prompt.slice(0, 180)}`,
    ctaText: "Salve este vídeo e grave amanhã. Consistência vence improviso.",
    instagramCaption: `Conteúdo direto sobre ${theme}.\n\nSem promessa vazia. Sem atalho milagroso.\n\nSe fizer sentido, me chama no direto.\n\n#conteudo #${input.profession}`,
    tiktokCaption: `${theme} sem hype. Erro comum, critério claro, próximo passo.`,
    ethicalTheme: `Enquadramento ${framingLabel(input.profession)}`,
    ethicalFraming: `O vídeo informa e contextualiza. Não promete resultado garantido e não pressiona a audiência.`,
    compliancePassed: true,
    complianceNotes: input.rules.map((rule) => `${rule.code}: ${rule.title}`).join(" · "),
    targetDate: input.targetDate,
  };
}

export async function generateScripts(input: {
  prompt: string;
  profile: ProfileRow;
  targetDate: string;
  days: number;
  rules: ComplianceRule[];
}): Promise<{ message: string; scripts: GeneratedScript[] }> {
  const dates = Array.from({ length: input.days }, (_, index) => addDays(input.targetDate, index));
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    const scripts = dates.map((date) =>
      fallbackScript({
        prompt: input.prompt,
        profession: input.profile.profession,
        niche: input.profile.niche,
        targetDate: date,
        rules: input.rules,
      }),
    );
    return {
      message:
        "Preparei a pauta com tom responsável. Sem chave de modelo neste ambiente, usei o gerador local — o enquadramento e os 3 atos já estão prontos.",
      scripts,
    };
  }

  const system = `Você é o copiloto editorial do ContentOS, em português do Brasil, tom sóbrio, claro e adulto.
Público: qualquer pessoa que publica conteúdo (criadores, negócios, educadores, marcas pessoais). Perfil: ${input.profile.profession}. Nicho: ${input.profile.niche ?? "geral"}.
Evite jargão de consultório ou de tribunal, salvo se o pedido for explicitamente dessa área.
Regras obrigatórias:\n${input.rules.map((rule) => `- ${rule.code} ${rule.title}: ${rule.instruction}`).join("\n")}
Gere exatamente ${dates.length} item(ns), um por data: ${dates.join(", ")}.
Cada item: title, hookText (0-3s), bodyText (4-45s), ctaText (46-60s), instagramCaption, tiktokCaption, ethicalTheme, ethicalFraming, compliancePassed, complianceNotes, targetDate.
Responda somente JSON: {"message": string, "scripts": GeneratedScript[]}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: input.prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha no modelo: ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const parsed = JSON.parse(payload.choices[0]?.message.content ?? "{}") as {
    message?: string;
    scripts?: GeneratedScript[];
  };

  if (!parsed.scripts?.length) {
    throw new Error("O modelo não devolveu roteiros.");
  }

  return {
    message: parsed.message ?? "Aqui está a pauta com o tom ajustado.",
    scripts: parsed.scripts,
  };
}
