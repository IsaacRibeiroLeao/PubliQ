import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSessionService,
  getCurrentSession,
  WorkspaceAccessError,
} from "@/modules/auth/session";
import {
  DEMO_USER,
  DEMO_WORKSPACE,
  DEMO_WORKSPACE_MEMBERSHIP,
} from "@/shared/demo-fixtures";

describe("getCurrentSession", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the deterministic demo identity in mock mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_INTEGRATION_MODE", "mock");

    await expect(getCurrentSession()).resolves.toEqual({
      user: DEMO_USER,
      memberships: [DEMO_WORKSPACE_MEMBERSHIP],
    });
  });
});

describe("requireWorkspaceAccess", () => {
  it("denies access when repository membership belongs to another tenant", async () => {
    const service = createSessionService({
      getSession: async () => ({
        user: DEMO_USER,
        memberships: [],
      }),
      findMembership: async () => ({
        ...DEMO_WORKSPACE_MEMBERSHIP,
        workspaceId: "11111111-1111-4111-8111-111111111111",
      }),
    });

    await expect(
      service.requireWorkspaceAccess(DEMO_WORKSPACE.id),
    ).rejects.toBeInstanceOf(WorkspaceAccessError);
  });

  it("enforces allowed roles from authoritative membership data", async () => {
    const service = createSessionService({
      getSession: async () => ({
        user: DEMO_USER,
        memberships: [],
      }),
      findMembership: async () => ({
        ...DEMO_WORKSPACE_MEMBERSHIP,
        role: "VIEWER",
      }),
    });

    await expect(
      service.requireWorkspaceAccess(DEMO_WORKSPACE.id, ["OWNER", "ADMIN"]),
    ).rejects.toBeInstanceOf(WorkspaceAccessError);
  });
});
