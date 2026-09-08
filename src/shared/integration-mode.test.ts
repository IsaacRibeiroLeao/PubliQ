import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getIntegrationMode,
  getIntegrationModeLabel,
  resolveIntegrationMode,
} from "@/shared/integration-mode";

describe("resolveIntegrationMode", () => {
  it("defaults to mock when unset", () => {
    expect(resolveIntegrationMode(undefined)).toBe("mock");
  });

  it("returns real only when explicitly set", () => {
    expect(resolveIntegrationMode("real")).toBe("real");
    expect(resolveIntegrationMode("mock")).toBe("mock");
    expect(resolveIntegrationMode("invalid")).toBe("mock");
  });
});

describe("getIntegrationMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses static process.env.NEXT_PUBLIC_INTEGRATION_MODE access", () => {
    vi.stubEnv("NEXT_PUBLIC_INTEGRATION_MODE", "real");
    expect(getIntegrationMode()).toBe("real");
  });

  it("defaults to mock when env is unset", () => {
    vi.unstubAllEnvs();
    expect(getIntegrationMode()).toBe("mock");
  });
});

describe("getIntegrationModeLabel", () => {
  it("maps mode to display label", () => {
    expect(getIntegrationModeLabel("mock")).toBe("mock");
    expect(getIntegrationModeLabel("real")).toBe("real");
  });
});
