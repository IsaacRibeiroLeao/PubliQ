import type { BrandRepository } from "@/modules/brands/repository";
import type { WorkspaceMembership, WorkspaceRole } from "@/shared/domain";
import type { OAuthStateStore } from "@/modules/meta/oauth";
import type { MetaProvider } from "@/modules/meta/provider";
import type { MetaSelectionStore } from "@/modules/meta/selection-store";
import { getBrandRepository } from "@/modules/brands/service";
import { requireWorkspaceAccess } from "@/modules/auth/session";
import { getMetaOAuthStateStore } from "@/modules/meta/oauth";
import { getMetaProvider } from "@/modules/meta/provider";
import { getMetaSelectionStore } from "@/modules/meta/selection-store";

export const META_MANAGER_ROLES = ["OWNER", "ADMIN"] as const;

interface MetaOAuthWorkflowDependencies {
  requireAccess: (
    workspaceId: string,
    roles: readonly WorkspaceRole[],
  ) => Promise<WorkspaceMembership>;
  findBrand: BrandRepository["findById"];
  stateStore: OAuthStateStore;
  selectionStore: MetaSelectionStore;
  provider: MetaProvider;
}

export function createMetaOAuthWorkflow(
  dependencies: MetaOAuthWorkflowDependencies,
) {
  return {
    start: async (input: {
      userId: string;
      workspaceId: string;
      brandId: string;
      returnTo: string;
      redirectUri: string;
    }): Promise<string> => {
      await dependencies.requireAccess(
        input.workspaceId,
        META_MANAGER_ROLES,
      );
      const brand = await dependencies.findBrand(
        input.workspaceId,
        input.brandId,
      );
      if (!brand) {
        throw new Error("Marca não encontrada no workspace.");
      }
      const state = await dependencies.stateStore.issue({
        userId: input.userId,
        workspaceId: input.workspaceId,
        brandId: input.brandId,
        returnTo: input.returnTo,
      });
      return dependencies.provider.getAuthorizationUrl({
        state,
        redirectUri: input.redirectUri,
      });
    },
    callback: async (input: {
      userId: string;
      state: string;
      code: string;
      redirectUri: string;
    }): Promise<{ selectionId: string; returnTo: string }> => {
      const payload = await dependencies.stateStore.consume(input.state);
      if (!payload || payload.userId !== input.userId || !input.code) {
        throw new Error("Estado OAuth inválido.");
      }
      await dependencies.requireAccess(
        payload.workspaceId,
        META_MANAGER_ROLES,
      );
      const brand = await dependencies.findBrand(
        payload.workspaceId,
        payload.brandId,
      );
      if (!brand) {
        throw new Error("Marca não encontrada no workspace.");
      }
      const grant = await dependencies.provider.exchangeCode({
        code: input.code,
        redirectUri: input.redirectUri,
      });
      const assets = await dependencies.provider.listAssets(grant.accessToken);
      const selectionId = await dependencies.selectionStore.create({
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        brandId: payload.brandId,
        returnTo: payload.returnTo,
        grant,
        assets,
      });
      return { selectionId, returnTo: payload.returnTo };
    },
  };
}

export async function getMetaOAuthWorkflow() {
  const brandRepository = await getBrandRepository();
  return createMetaOAuthWorkflow({
    requireAccess: requireWorkspaceAccess,
    findBrand: brandRepository.findById,
    stateStore: getMetaOAuthStateStore(),
    selectionStore: getMetaSelectionStore(),
    provider: getMetaProvider(),
  });
}
