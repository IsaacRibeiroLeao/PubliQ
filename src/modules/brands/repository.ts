import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_BRAND } from "@/shared/demo-fixtures";
import type { Brand } from "@/shared/domain";
import type { Database, Json } from "@/shared/database.types";
import type { BrandFormValues } from "@/modules/brands/schemas";

export interface BrandCreativeSummary {
  id: string;
  title: string;
  status: "pending_review" | "changes_requested" | "approved";
  createdAt: string;
}

export interface BrandRepository {
  list: (workspaceId: string) => Promise<readonly Brand[]>;
  findById: (workspaceId: string, brandId: string) => Promise<Brand | null>;
  count: (workspaceId: string) => Promise<number>;
  createWithinLimit: (
    workspaceId: string,
    values: BrandFormValues,
  ) => Promise<Brand>;
  update: (
    workspaceId: string,
    brandId: string,
    values: BrandFormValues,
  ) => Promise<Brand>;
  listRecentCreatives: (
    workspaceId: string,
    brandId: string,
  ) => Promise<readonly BrandCreativeSummary[]>;
}

export class BrandLimitError extends Error {
  constructor() {
    super("O limite de marcas do plano foi atingido.");
    this.name = "BrandLimitError";
  }
}

export interface MockBrandRepositoryOptions {
  initialBrands?: readonly Brand[];
  brandLimit?: number;
  now?: () => string;
}

function toBrand(
  row: Database["public"]["Tables"]["brands"]["Row"],
): Brand {
  const persona =
    row.persona && typeof row.persona === "object" && !Array.isArray(row.persona)
      ? row.persona
      : {};

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    niche: row.niche,
    valueProposition: row.value_proposition,
    persona,
    targetAudience: row.target_audience,
    toneOfVoice: row.tone_of_voice,
    voiceExamples: row.voice_examples,
    forbiddenWords: row.forbidden_words,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function valuesToPersistence(values: BrandFormValues) {
  return {
    name: values.name,
    niche: values.niche,
    value_proposition: values.valueProposition,
    persona: { description: values.persona } satisfies Json,
    target_audience: values.targetAudience,
    tone_of_voice: values.toneOfVoice,
    voice_examples: values.voiceExamples,
    forbidden_words: values.forbiddenWords,
  };
}

export function createMockBrandRepository(
  options: MockBrandRepositoryOptions = {},
): BrandRepository {
  const initialBrands = options.initialBrands ?? [DEMO_BRAND];
  const brandsByWorkspace = new Map<string, Brand[]>();
  const queues = new Map<string, Promise<void>>();
  let sequence = 10;
  const now = options.now ?? (() => "2026-01-15T12:00:00.000Z");
  const brandLimit = options.brandLimit ?? 3;

  for (const brand of initialBrands) {
    brandsByWorkspace.set(brand.workspaceId, [
      ...(brandsByWorkspace.get(brand.workspaceId) ?? []),
      { ...brand },
    ]);
  }

  async function serialize<T>(
    workspaceId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = queues.get(workspaceId) ?? Promise.resolve();
    let release = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.then(() => gate);
    queues.set(workspaceId, queued);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (queues.get(workspaceId) === queued) {
        queues.delete(workspaceId);
      }
    }
  }

  return {
    list: async (workspaceId) => [...(brandsByWorkspace.get(workspaceId) ?? [])],
    findById: async (workspaceId, brandId) =>
      brandsByWorkspace
        .get(workspaceId)
        ?.find((brand) => brand.id === brandId) ?? null,
    count: async (workspaceId) =>
      brandsByWorkspace.get(workspaceId)?.length ?? 0,
    createWithinLimit: (workspaceId, values) =>
      serialize(workspaceId, async () => {
        const brands = brandsByWorkspace.get(workspaceId) ?? [];
        if (brands.length >= brandLimit) {
          throw new BrandLimitError();
        }
        const timestamp = now();
        const brand: Brand = {
          id: `00000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}`,
          workspaceId,
          ...values,
          persona: { description: values.persona },
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        brandsByWorkspace.set(workspaceId, [...brands, brand]);
        return brand;
      }),
    update: async (workspaceId, brandId, values) => {
      const brands = brandsByWorkspace.get(workspaceId) ?? [];
      const current = brands.find((brand) => brand.id === brandId);
      if (!current) {
        throw new Error("Marca não encontrada.");
      }
      const updated: Brand = {
        ...current,
        ...values,
        persona: { description: values.persona },
        updatedAt: now(),
      };
      brandsByWorkspace.set(
        workspaceId,
        brands.map((brand) => (brand.id === brandId ? updated : brand)),
      );
      return updated;
    },
    listRecentCreatives: async (_workspaceId, brandId) =>
      brandId === DEMO_BRAND.id
        ? [
            {
              id: "00000000-0000-4000-8000-000000000020",
              title: "Café de origem, sem complicação.",
              status: "approved",
              createdAt: "2026-01-15T12:00:00.000Z",
            },
          ]
        : [],
  };
}

export const mockBrandRepository = createMockBrandRepository();

export function createSupabaseBrandRepository(
  supabase: SupabaseClient<Database>,
): BrandRepository {
  return {
    list: async (workspaceId) => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data.map(toBrand);
    },
    findById: async (workspaceId, brandId) => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("id", brandId)
        .maybeSingle();
      if (error) throw error;
      return data ? toBrand(data) : null;
    },
    count: async (workspaceId) => {
      const { count, error } = await supabase
        .from("brands")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);
      if (error) throw error;
      return count ?? 0;
    },
    createWithinLimit: async (workspaceId, values) => {
      const { data, error } = await supabase
        .rpc("create_brand_with_plan_limit", {
          p_workspace_id: workspaceId,
          p_name: values.name,
          p_niche: values.niche,
          p_value_proposition: values.valueProposition,
          p_persona: { description: values.persona },
          p_target_audience: values.targetAudience,
          p_tone_of_voice: values.toneOfVoice,
          p_voice_examples: values.voiceExamples,
          p_forbidden_words: values.forbiddenWords,
        })
        .single();
      if (error) {
        if (error.message.includes("brand_limit_reached")) {
          throw new BrandLimitError();
        }
        throw error;
      }
      return toBrand(data);
    },
    update: async (workspaceId, brandId, values) => {
      const { data, error } = await supabase
        .from("brands")
        .update(valuesToPersistence(values))
        .eq("workspace_id", workspaceId)
        .eq("id", brandId)
        .select()
        .single();
      if (error) throw error;
      return toBrand(data);
    },
    listRecentCreatives: async (workspaceId, brandId) => {
      const { data, error } = await supabase
        .from("generations")
        .select("id, approval_status, created_at, organic_copy, media_uploads!inner(brand_id)")
        .eq("workspace_id", workspaceId)
        .eq("media_uploads.brand_id", brandId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data.map((creative) => {
        const organicCopy = creative.organic_copy;
        const title =
          organicCopy &&
          typeof organicCopy === "object" &&
          !Array.isArray(organicCopy) &&
          typeof organicCopy.caption === "string"
            ? organicCopy.caption.slice(0, 80)
            : "Criativo sem título";
        return {
          id: creative.id,
          title,
          status: creative.approval_status,
          createdAt: creative.created_at,
        };
      });
    },
  };
}
