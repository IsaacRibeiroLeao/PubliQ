import { describe, expect, it } from "vitest";
import {
  BrandLimitError,
  calculateBrandCompleteness,
  createBrandService,
} from "@/modules/brands/service";
import type { BrandRepository } from "@/modules/brands/repository";
import { createMockBrandRepository } from "@/modules/brands/repository";
import { DEMO_BRAND, DEMO_WORKSPACE_MEMBERSHIP } from "@/shared/demo-fixtures";

const input = {
  name: "Café Horizonte",
  niche: "Cafeteria",
  valueProposition: "Café rastreável entregue sem complicação.",
  targetAudience: "Pessoas que valorizam café brasileiro de origem.",
  persona: "Marina, 34 anos, compra café especial para casa.",
  toneOfVoice: "Próximo, claro e otimista.",
  voiceExamples: ["Café bom tem história."],
  forbiddenWords: ["milagre"],
};

function repositoryWithBrandCount(count: number): BrandRepository {
  return {
    list: async () => [],
    findById: async () => null,
    count: async () => count,
    createWithinLimit: async (_workspaceId, values) => {
      if (count >= 3) {
        throw new BrandLimitError();
      }
      return { ...DEMO_BRAND, name: values.name };
    },
    update: async () => DEMO_BRAND,
    listRecentCreatives: async () => [],
  };
}

describe("brand service", () => {
  it("blocks creation when the workspace plan brand limit is reached", async () => {
    const service = createBrandService({
      repository: repositoryWithBrandCount(3),
      getMembership: async () => DEMO_WORKSPACE_MEMBERSHIP,
    });

    await expect(
      service.create(DEMO_WORKSPACE_MEMBERSHIP.workspaceId, input),
    ).rejects.toBeInstanceOf(BrandLimitError);
  });

  it("keeps VIEWER memberships read-only", async () => {
    const service = createBrandService({
      repository: repositoryWithBrandCount(0),
      getMembership: async () => ({
        ...DEMO_WORKSPACE_MEMBERSHIP,
        role: "VIEWER",
      }),
    });

    await expect(
      service.create(DEMO_WORKSPACE_MEMBERSHIP.workspaceId, input),
    ).rejects.toThrow("Workspace access is denied");
  });

  it("keeps brand updates unavailable to VIEWER memberships", async () => {
    const service = createBrandService({
      repository: {
        ...repositoryWithBrandCount(0),
        findById: async () => DEMO_BRAND,
      },
      getMembership: async () => ({
        ...DEMO_WORKSPACE_MEMBERSHIP,
        role: "VIEWER",
      }),
    });

    await expect(
      service.update(
        DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        DEMO_BRAND.id,
        input,
      ),
    ).rejects.toThrow("Workspace access is denied");
  });

  it("serializes concurrent mock creation at the plan limit", async () => {
    const repository = createMockBrandRepository({
      initialBrands: [],
      brandLimit: 1,
      now: () => "2026-01-15T12:00:00.000Z",
    });

    const results = await Promise.allSettled([
      repository.createWithinLimit(
        DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        input,
      ),
      repository.createWithinLimit(
        DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        { ...input, name: "Segunda marca" },
      ),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      1,
    );
    await expect(
      repository.count(DEMO_WORKSPACE_MEMBERSHIP.workspaceId),
    ).resolves.toBe(1);
    const brands = await repository.list(
      DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
    );
    expect(brands[0]?.createdAt).toBe("2026-01-15T12:00:00.000Z");
  });

  it("reports a complete profile as 100 percent", () => {
    expect(calculateBrandCompleteness(DEMO_BRAND)).toBe(100);
  });

  it("does not penalize a profile without optional forbidden words", () => {
    expect(
      calculateBrandCompleteness({ ...DEMO_BRAND, forbiddenWords: [] }),
    ).toBe(100);
  });
});
