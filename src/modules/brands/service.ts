import type { BrandRepository } from "@/modules/brands/repository";
import {
  createSupabaseBrandRepository,
  mockBrandRepository,
} from "@/modules/brands/repository";
import {
  brandFormSchema,
  type BrandFormValues,
} from "@/modules/brands/schemas";
import { WorkspaceAccessError } from "@/modules/auth/session";
import { assertWorkspaceRole } from "@/modules/auth/authorization";
import { requireWorkspaceAccess } from "@/modules/auth/session";
import type { Brand, WorkspaceMembership } from "@/shared/domain";
import { getIntegrationMode } from "@/shared/integration-mode";

const WRITER_ROLES = ["OWNER", "ADMIN", "EDITOR"] as const;

export { BrandLimitError } from "@/modules/brands/repository";

interface BrandServiceDependencies {
  repository: BrandRepository;
  getMembership: (workspaceId: string) => Promise<WorkspaceMembership>;
}

export interface BrandService {
  create: (workspaceId: string, values: BrandFormValues) => Promise<Brand>;
  update: (
    workspaceId: string,
    brandId: string,
    values: BrandFormValues,
  ) => Promise<Brand>;
}

function assertCanWrite(membership: WorkspaceMembership): void {
  try {
    assertWorkspaceRole(membership.role, { allowedRoles: WRITER_ROLES });
  } catch {
    throw new WorkspaceAccessError();
  }
}

export function createBrandService(
  dependencies: BrandServiceDependencies,
): BrandService {
  return {
    create: async (workspaceId, values) => {
      const membership = await dependencies.getMembership(workspaceId);
      assertCanWrite(membership);
      const parsedValues = brandFormSchema.parse(values);
      return dependencies.repository.createWithinLimit(
        workspaceId,
        parsedValues,
      );
    },
    update: async (workspaceId, brandId, values) => {
      const membership = await dependencies.getMembership(workspaceId);
      assertCanWrite(membership);
      const existing = await dependencies.repository.findById(
        workspaceId,
        brandId,
      );
      if (!existing) {
        throw new Error("Marca não encontrada.");
      }
      return dependencies.repository.update(
        workspaceId,
        brandId,
        brandFormSchema.parse(values),
      );
    },
  };
}

export function calculateBrandCompleteness(brand: Brand): number {
  const fields = [
    brand.name,
    brand.niche,
    brand.valueProposition,
    brand.targetAudience,
    brand.toneOfVoice,
    Object.keys(brand.persona).length > 0,
    brand.voiceExamples.length > 0,
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

export function getPersonaDescription(brand: Brand): string {
  const description = brand.persona.description;
  return typeof description === "string"
    ? description
    : Object.values(brand.persona)
        .filter((value): value is string => typeof value === "string")
        .join(", ");
}

export async function getBrandRepository(): Promise<BrandRepository> {
  if (getIntegrationMode() === "mock") {
    return mockBrandRepository;
  }
  const { createServerSupabaseClient } = await import(
    "@/integrations/supabase/server"
  );
  return createSupabaseBrandRepository(await createServerSupabaseClient());
}

export async function getBrandService(): Promise<BrandService> {
  return createBrandService({
    repository: await getBrandRepository(),
    getMembership: (workspaceId) =>
      requireWorkspaceAccess(workspaceId, WRITER_ROLES),
  });
}
