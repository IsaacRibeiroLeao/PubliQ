import { assertWorkspaceRole } from "@/modules/auth/authorization";
import {
  requireWorkspaceAccess,
  WorkspaceAccessError,
} from "@/modules/auth/session";
import {
  getEncryptionService,
  type EncryptionService,
} from "@/modules/meta/encryption";
import {
  createMockMetaConnectionRepository,
  createSupabaseMetaConnectionRepository,
  type MetaConnectionRepository,
  type MetaConnectionRecord,
} from "@/modules/meta/repository";
import type { WorkspaceMembership } from "@/shared/domain";
import { getIntegrationMode } from "@/shared/integration-mode";

const CONNECTION_ROLES = ["OWNER", "ADMIN"] as const;

export interface ConnectMetaInput {
  workspaceId: string;
  brandId: string;
  accessToken: string;
  expiresAt: string | null;
  scopes: string[];
  pageId: string;
  instagramAccountId: string | null;
  adAccountId: string | null;
}

interface MetaConnectionServiceDependencies {
  encryption: EncryptionService;
  repository: MetaConnectionRepository;
  getMembership: (workspaceId: string) => Promise<WorkspaceMembership>;
}

export function createMetaConnectionService(
  dependencies: MetaConnectionServiceDependencies,
) {
  return {
    connect: async (input: ConnectMetaInput): Promise<MetaConnectionRecord> => {
      const membership = await dependencies.getMembership(input.workspaceId);
      try {
        assertWorkspaceRole(membership.role, {
          allowedRoles: CONNECTION_ROLES,
        });
      } catch {
        throw new WorkspaceAccessError();
      }
      const encrypted = await dependencies.encryption.encrypt(input.accessToken);
      return dependencies.repository.save({
        workspaceId: input.workspaceId,
        brandId: input.brandId,
        status: "active",
        accessTokenCipher: encrypted.cipher,
        accessTokenIv: encrypted.iv,
        accessTokenTag: encrypted.tag,
        keyVersion: encrypted.keyVersion,
        tokenExpiresAt: input.expiresAt,
        scopes: input.scopes,
        pageId: input.pageId,
        instagramAccountId: input.instagramAccountId,
        adAccountId: input.adAccountId,
        lastValidatedAt: new Date().toISOString(),
      });
    },
  };
}

export async function getMetaConnectionRepository(): Promise<MetaConnectionRepository> {
  if (getIntegrationMode() === "mock") {
    return createMockMetaConnectionRepository();
  }
  const { createServerSupabaseClient } = await import(
    "@/integrations/supabase/server"
  );
  return createSupabaseMetaConnectionRepository(
    await createServerSupabaseClient(),
  );
}

export async function getMetaConnectionService() {
  return createMetaConnectionService({
    encryption: getEncryptionService(),
    repository: await getMetaConnectionRepository(),
    getMembership: (workspaceId) =>
      requireWorkspaceAccess(workspaceId, CONNECTION_ROLES),
  });
}
