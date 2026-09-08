import { describe, expect, it } from "vitest";
import {
  resolveCurrentWorkspaceContext,
} from "@/modules/workspaces/context";
import { WorkspaceAccessError } from "@/modules/auth/session";
import {
  DEMO_USER,
  DEMO_WORKSPACE,
  DEMO_WORKSPACE_MEMBERSHIP,
} from "@/shared/demo-fixtures";

describe("current workspace context", () => {
  it("denies an authenticated session without memberships", async () => {
    await expect(
      resolveCurrentWorkspaceContext(
        { user: DEMO_USER, memberships: [] },
        async () => DEMO_WORKSPACE,
      ),
    ).rejects.toBeInstanceOf(WorkspaceAccessError);
  });

  it("loads the current workspace from the membership repository", async () => {
    await expect(
      resolveCurrentWorkspaceContext(
        {
          user: DEMO_USER,
          memberships: [DEMO_WORKSPACE_MEMBERSHIP],
        },
        async (workspaceId) =>
          workspaceId === DEMO_WORKSPACE.id ? DEMO_WORKSPACE : null,
      ),
    ).resolves.toEqual({
      user: DEMO_USER,
      membership: DEMO_WORKSPACE_MEMBERSHIP,
      workspace: DEMO_WORKSPACE,
    });
  });
});
