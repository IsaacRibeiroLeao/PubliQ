import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  assertWorkspaceRole,
} from "@/modules/auth/authorization";

describe("assertWorkspaceRole", () => {
  it("allows roles at or above the required minimum", () => {
    expect(() =>
      assertWorkspaceRole("ADMIN", { minimumRole: "EDITOR" }),
    ).not.toThrow();
    expect(() =>
      assertWorkspaceRole("OWNER", { minimumRole: "ADMIN" }),
    ).not.toThrow();
  });

  it("denies roles below the required minimum", () => {
    expect(() =>
      assertWorkspaceRole("VIEWER", { minimumRole: "EDITOR" }),
    ).toThrow(AuthorizationError);
  });

  it("enforces an explicit allowed-role list", () => {
    expect(() =>
      assertWorkspaceRole("ADMIN", { allowedRoles: ["OWNER", "ADMIN"] }),
    ).not.toThrow();
    expect(() =>
      assertWorkspaceRole("EDITOR", { allowedRoles: ["OWNER", "ADMIN"] }),
    ).toThrow(AuthorizationError);
  });
});
