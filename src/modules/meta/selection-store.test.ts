import { describe, expect, it } from "vitest";
import { createInMemoryMetaSelectionStore } from "@/modules/meta/selection-store";

const selection = {
  userId: "user-1",
  workspaceId: "workspace-1",
  brandId: "brand-1",
  returnTo: "/app/marcas/brand-1",
  grant: {
    accessToken: "server-token",
    expiresAt: null,
    scopes: ["pages_show_list"],
  },
  assets: [
    {
      pageId: "page-1",
      pageName: "Página 1",
      instagramAccountId: null,
      instagramAccountName: null,
      adAccountIds: [],
    },
  ],
};

describe("Meta selection store", () => {
  it("allows only the initiating user and bound workspace to view state", async () => {
    const store = createInMemoryMetaSelectionStore(
      () => 1_000,
      () => "selection-1",
    );
    const id = await store.create(selection);

    await expect(
      store.view(id, {
        userId: "other-user",
        workspaceIds: ["workspace-1"],
      }),
    ).resolves.toBeNull();
    await expect(
      store.view(id, {
        userId: "user-1",
        workspaceIds: ["other-workspace"],
      }),
    ).resolves.toBeNull();
    await expect(
      store.view(id, {
        userId: "user-1",
        workspaceIds: ["workspace-1"],
      }),
    ).resolves.toMatchObject({ brandId: "brand-1" });
  });

  it("expires selection state before view or consume", async () => {
    let now = 1_000;
    const store = createInMemoryMetaSelectionStore(
      () => now,
      () => "selection-1",
    );
    const id = await store.create(selection);
    now += 10 * 60 * 1_000 + 1;

    await expect(
      store.view(id, {
        userId: "user-1",
        workspaceIds: ["workspace-1"],
      }),
    ).resolves.toBeNull();
    await expect(
      store.consume(id, {
        userId: "user-1",
        workspaceId: "workspace-1",
        brandId: "brand-1",
      }),
    ).resolves.toBeNull();
  });

  it("consumes bound selection state only once", async () => {
    const store = createInMemoryMetaSelectionStore(
      () => 1_000,
      () => "selection-1",
    );
    const id = await store.create(selection);
    const actor = {
      userId: "user-1",
      workspaceId: "workspace-1",
      brandId: "brand-1",
    };

    await expect(store.consume(id, actor)).resolves.toMatchObject({
      grant: { accessToken: "server-token" },
    });
    await expect(store.consume(id, actor)).resolves.toBeNull();
  });
});
