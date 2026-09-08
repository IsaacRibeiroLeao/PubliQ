import { randomBytes } from "node:crypto";
import { runUpstashCommand } from "@/modules/meta/upstash";
import { getIntegrationMode } from "@/shared/integration-mode";

export interface MetaOAuthStatePayload {
  userId: string;
  workspaceId: string;
  brandId: string;
  returnTo: string;
}

export interface OAuthStateStore {
  issue: (payload: MetaOAuthStatePayload) => Promise<string>;
  consume: (state: string) => Promise<MetaOAuthStatePayload | null>;
}

interface StoredState {
  payload: MetaOAuthStatePayload;
  expiresAt: number;
}

export function sanitizeReturnPath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/app/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/app/marcas";
  }
  return value;
}

export function sanitizeMetaError(error: unknown): string {
  void error;
  return "Não foi possível concluir a conexão com a Meta.";
}

export function createInMemoryOAuthStateStore(
  createState = () => randomBytes(32).toString("base64url"),
  now = () => Date.now(),
): OAuthStateStore {
  const states = new Map<string, StoredState>();

  return {
    issue: async (payload) => {
      const state = createState();
      states.set(state, {
        payload: { ...payload, returnTo: sanitizeReturnPath(payload.returnTo) },
        expiresAt: now() + 10 * 60 * 1000,
      });
      return state;
    },
    consume: async (state) => {
      const stored = states.get(state);
      states.delete(state);
      if (!stored || stored.expiresAt < now()) {
        return null;
      }
      return stored.payload;
    },
  };
}

export const metaOAuthStateStore = createInMemoryOAuthStateStore();

function createUpstashOAuthStateStore(): OAuthStateStore {
  return {
    issue: async (payload) => {
      const state = randomBytes(32).toString("base64url");
      await runUpstashCommand([
        "SET",
        `meta:oauth:${state}`,
        JSON.stringify({
          ...payload,
          returnTo: sanitizeReturnPath(payload.returnTo),
        }),
        "EX",
        600,
      ]);
      return state;
    },
    consume: async (state) => {
      const result = await runUpstashCommand<string | null>([
        "GETDEL",
        `meta:oauth:${state}`,
      ]);
      return result ? (JSON.parse(result) as MetaOAuthStatePayload) : null;
    },
  };
}

export function getMetaOAuthStateStore(): OAuthStateStore {
  return getIntegrationMode() === "mock"
    ? metaOAuthStateStore
    : createUpstashOAuthStateStore();
}
