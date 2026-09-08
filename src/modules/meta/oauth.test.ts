import { describe, expect, it } from "vitest";
import {
  createInMemoryOAuthStateStore,
  sanitizeMetaError,
  sanitizeReturnPath,
} from "@/modules/meta/oauth";

describe("Meta OAuth contracts", () => {
  it("accepts only local return paths inside the authenticated app", () => {
    expect(sanitizeReturnPath("/app/marcas/brand-1")).toBe(
      "/app/marcas/brand-1",
    );
    expect(sanitizeReturnPath("https://attacker.example")).toBe("/app/marcas");
    expect(sanitizeReturnPath("//attacker.example")).toBe("/app/marcas");
    expect(sanitizeReturnPath("/login")).toBe("/app/marcas");
  });

  it("issues unpredictable state and consumes it only once", async () => {
    let sequence = 0;
    const store = createInMemoryOAuthStateStore(() => `state-${++sequence}`);
    const payload = {
      userId: "user-1",
      workspaceId: "workspace-1",
      brandId: "brand-1",
      returnTo: "/app/marcas/brand-1",
    };

    const firstState = await store.issue(payload);
    const secondState = await store.issue(payload);

    expect(firstState).not.toBe(secondState);
    await expect(store.consume(firstState)).resolves.toEqual(payload);
    await expect(store.consume(firstState)).resolves.toBeNull();
  });

  it("does not expose provider messages or tokens in user-facing errors", () => {
    const providerError = new Error(
      "OAuth failed for token EAAG-secret-token at graph.facebook.com",
    );

    expect(sanitizeMetaError(providerError)).toBe(
      "Não foi possível concluir a conexão com a Meta.",
    );
  });
});
