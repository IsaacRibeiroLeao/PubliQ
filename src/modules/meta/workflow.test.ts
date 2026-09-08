import { describe, expect, it, vi } from "vitest";
import { createMetaOAuthWorkflow } from "@/modules/meta/workflow";
import { DEMO_BRAND, DEMO_WORKSPACE_MEMBERSHIP } from "@/shared/demo-fixtures";

function dependencies() {
  return {
    requireAccess: vi.fn(async () => DEMO_WORKSPACE_MEMBERSHIP),
    findBrand: vi.fn(async () => DEMO_BRAND),
    stateStore: {
      issue: vi.fn(async () => "oauth-state"),
      consume: vi.fn(async () => ({
        userId: "user-1",
        workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        brandId: DEMO_BRAND.id,
        returnTo: `/app/marcas/${DEMO_BRAND.id}`,
      })),
    },
    selectionStore: {
      create: vi.fn(async () => "selection-1"),
      view: vi.fn(),
      consume: vi.fn(),
    },
    provider: {
      getAuthorizationUrl: vi.fn(
        ({ state }: { state: string; redirectUri: string }) =>
          `https://meta.example/oauth?state=${state}`,
      ),
      exchangeCode: vi.fn(async () => ({
        accessToken: "server-token",
        expiresAt: null,
        scopes: ["pages_show_list"],
      })),
      listAssets: vi.fn(async () => []),
    },
  };
}

describe("Meta OAuth workflow", () => {
  it("verifies the brand belongs to the workspace before issuing state", async () => {
    const deps = dependencies();
    deps.findBrand.mockResolvedValue(null);
    const workflow = createMetaOAuthWorkflow(deps);

    await expect(
      workflow.start({
        userId: "user-1",
        workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        brandId: "other-brand",
        returnTo: "/app/marcas/other-brand",
        redirectUri: "https://app.example/app/meta/callback",
      }),
    ).rejects.toThrow("Marca não encontrada");
    expect(deps.stateStore.issue).not.toHaveBeenCalled();
  });

  it("requires OWNER or ADMIN before starting OAuth", async () => {
    const deps = dependencies();
    const workflow = createMetaOAuthWorkflow(deps);

    await workflow.start({
      userId: "user-1",
      workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
      brandId: DEMO_BRAND.id,
      returnTo: `/app/marcas/${DEMO_BRAND.id}`,
      redirectUri: "https://app.example/app/meta/callback",
    });

    expect(deps.requireAccess).toHaveBeenCalledWith(
      DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
      ["OWNER", "ADMIN"],
    );
  });

  it("binds callback selection state to the initiating user and brand", async () => {
    const deps = dependencies();
    const workflow = createMetaOAuthWorkflow(deps);

    await expect(
      workflow.callback({
        userId: "user-1",
        state: "oauth-state",
        code: "oauth-code",
        redirectUri: "https://app.example/app/meta/callback",
      }),
    ).resolves.toEqual({
      selectionId: "selection-1",
      returnTo: `/app/marcas/${DEMO_BRAND.id}`,
    });
    expect(deps.selectionStore.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        workspaceId: DEMO_WORKSPACE_MEMBERSHIP.workspaceId,
        brandId: DEMO_BRAND.id,
        grant: expect.objectContaining({ accessToken: "server-token" }),
      }),
    );
  });

  it("rejects a callback handled by a different user", async () => {
    const deps = dependencies();
    const workflow = createMetaOAuthWorkflow(deps);

    await expect(
      workflow.callback({
        userId: "other-user",
        state: "oauth-state",
        code: "oauth-code",
        redirectUri: "https://app.example/app/meta/callback",
      }),
    ).rejects.toThrow("Estado OAuth inválido");
    expect(deps.provider.exchangeCode).not.toHaveBeenCalled();
  });
});
