export type IntegrationMode = "mock" | "real";

export function resolveIntegrationMode(
  rawMode: string | undefined,
): IntegrationMode {
  return rawMode === "real" ? "real" : "mock";
}

export function getIntegrationMode(): IntegrationMode {
  return resolveIntegrationMode(process.env.NEXT_PUBLIC_INTEGRATION_MODE);
}

export function getIntegrationModeLabel(mode: IntegrationMode): string {
  return mode === "real" ? "real" : "mock";
}
