import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/modules/auth/redirect";

describe("getSafeRedirectPath", () => {
  it("keeps local application paths", () => {
    expect(getSafeRedirectPath("/workspace/demo?tab=brand#voice")).toBe(
      "/workspace/demo?tab=brand#voice",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "/\\attacker.example/steal",
    "javascript:alert(1)",
    "workspace/demo",
  ])("replaces unsafe redirect %s with the fallback", (redirectPath) => {
    expect(getSafeRedirectPath(redirectPath, "/dashboard")).toBe("/dashboard");
  });
});
