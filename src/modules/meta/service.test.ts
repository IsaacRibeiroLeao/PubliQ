import { describe, expect, it, vi } from "vitest";
import { createMetaConnectionService } from "@/modules/meta/service";
import type { EncryptionService } from "@/modules/meta/encryption";
import type { MetaConnectionRepository } from "@/modules/meta/repository";
import { DEMO_WORKSPACE_MEMBERSHIP } from "@/shared/demo-fixtures";

describe("Meta connection service", () => {
  it("encrypts the provider token before persistence", async () => {
    const encryption: EncryptionService = {
      encrypt: vi.fn(async () => ({
        cipher: "encrypted-value",
        iv: "random-iv",
        tag: "auth-tag",
        keyVersion: 1,
      })),
      decrypt: vi.fn(async () => "provider-token"),
    };
    const repository: MetaConnectionRepository = {
      getStatus: async () => null,
      save: vi.fn(async (connection) => connection),
    };
    const service = createMetaConnectionService({
      encryption,
      repository,
      getMembership: async () => DEMO_WORKSPACE_MEMBERSHIP,
    });

    await service.connect({
      workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
      brandId: "brand-1",
      accessToken: "provider-token",
      expiresAt: "2026-11-01T00:00:00.000Z",
      scopes: ["pages_show_list"],
      pageId: "page-1",
      instagramAccountId: "instagram-1",
      adAccountId: null,
    });

    const saved = vi.mocked(repository.save).mock.calls[0]?.[0];
    expect(saved?.accessTokenCipher).toBe("encrypted-value");
    expect(JSON.stringify(saved)).not.toContain("provider-token");
  });

  it("rejects connection changes from an EDITOR", async () => {
    const service = createMetaConnectionService({
      encryption: {
        encrypt: async () => ({
          cipher: "cipher",
          iv: "iv",
          tag: "tag",
          keyVersion: 1,
        }),
        decrypt: async () => "",
      },
      repository: {
        getStatus: async () => null,
        save: async (connection) => connection,
      },
      getMembership: async () => ({
        ...DEMO_WORKSPACE_MEMBERSHIP,
        role: "EDITOR",
      }),
    });

    await expect(
      service.connect({
        workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        brandId: "brand-1",
        accessToken: "provider-token",
        expiresAt: null,
        scopes: [],
        pageId: "page-1",
        instagramAccountId: null,
        adAccountId: null,
      }),
    ).rejects.toThrow("Workspace access is denied");
  });
});
