import { randomBytes } from "node:crypto";
import {
  getEncryptionService,
  type EncryptedSecret,
} from "@/modules/meta/encryption";
import type {
  MetaAsset,
  MetaAssetSelectionSession,
  MetaOAuthGrant,
} from "@/modules/meta/provider";
import { runUpstashCommand } from "@/modules/meta/upstash";
import { getIntegrationMode } from "@/shared/integration-mode";

export interface MetaSelectionSummary {
  id: string;
  workspaceId: string;
  brandId: string;
  assets: readonly MetaAsset[];
}

export interface MetaSelectionInput {
  userId: string;
  workspaceId: string;
  brandId: string;
  returnTo: string;
  grant: MetaOAuthGrant;
  assets: readonly MetaAsset[];
}

export interface MetaSelectionViewer {
  userId: string;
  workspaceIds: readonly string[];
}

export interface MetaSelectionConsumer {
  userId: string;
  workspaceId: string;
  brandId: string;
}

export interface MetaSelectionStore {
  create: (input: MetaSelectionInput) => Promise<string>;
  view: (
    id: string,
    viewer: MetaSelectionViewer,
  ) => Promise<MetaSelectionSummary | null>;
  consume: (
    id: string,
    consumer: MetaSelectionConsumer,
  ) => Promise<MetaAssetSelectionSession | null>;
}

interface StoredSelection extends MetaAssetSelectionSession {
  userId: string;
  expiresAt: number;
}

interface PersistedSelection {
  id: string;
  userId: string;
  workspaceId: string;
  brandId: string;
  returnTo: string;
  grant: Omit<MetaOAuthGrant, "accessToken">;
  encryptedAccessToken: EncryptedSecret;
  assets: readonly MetaAsset[];
  expiresAt: number;
}

function selectionKey(userId: string, workspaceId: string, id: string): string {
  return `meta:selection:${userId}:${workspaceId}:${id}`;
}

function toSummary(selection: {
  id: string;
  workspaceId: string;
  brandId: string;
  assets: readonly MetaAsset[];
}): MetaSelectionSummary {
  return {
    id: selection.id,
    workspaceId: selection.workspaceId,
    brandId: selection.brandId,
    assets: selection.assets,
  };
}

export function createInMemoryMetaSelectionStore(
  now = () => Date.now(),
  createId = () => randomBytes(24).toString("base64url"),
): MetaSelectionStore {
  const selections = new Map<string, StoredSelection>();
  return {
    create: async (input) => {
      const id = createId();
      selections.set(selectionKey(input.userId, input.workspaceId, id), {
        id,
        ...input,
        expiresAt: now() + 10 * 60 * 1000,
      });
      return id;
    },
    view: async (id, viewer) => {
      for (const workspaceId of viewer.workspaceIds) {
        const key = selectionKey(viewer.userId, workspaceId, id);
        const selection = selections.get(key);
        if (!selection) continue;
        if (selection.expiresAt < now()) {
          selections.delete(key);
          return null;
        }
        return toSummary(selection);
      }
      return null;
    },
    consume: async (id, consumer) => {
      const key = selectionKey(consumer.userId, consumer.workspaceId, id);
      const selection = selections.get(key);
      if (
        !selection ||
        selection.brandId !== consumer.brandId ||
        selection.expiresAt < now()
      ) {
        if (selection?.expiresAt && selection.expiresAt < now()) {
          selections.delete(key);
        }
        return null;
      }
      selections.delete(key);
      return selection;
    },
  };
}

function createUpstashMetaSelectionStore(
  now = () => Date.now(),
): MetaSelectionStore {
  return {
    create: async (input) => {
      const id = randomBytes(24).toString("base64url");
    const encryptedAccessToken = await getEncryptionService().encrypt(
      input.grant.accessToken,
    );
    const persisted: PersistedSelection = {
      id,
      userId: input.userId,
      workspaceId: input.workspaceId,
      brandId: input.brandId,
      returnTo: input.returnTo,
      grant: {
        expiresAt: input.grant.expiresAt,
        scopes: input.grant.scopes,
      },
      encryptedAccessToken,
      assets: input.assets,
      expiresAt: now() + 10 * 60 * 1000,
    };
    await runUpstashCommand([
      "SET",
      selectionKey(input.userId, input.workspaceId, id),
      JSON.stringify(persisted),
      "EX",
      600,
    ]);
    return id;
    },
    view: async (id, viewer) => {
      for (const workspaceId of viewer.workspaceIds) {
        const result = await runUpstashCommand<string | null>([
          "GET",
          selectionKey(viewer.userId, workspaceId, id),
        ]);
        if (!result) continue;
        const selection = JSON.parse(result) as PersistedSelection;
        if (
          selection.userId !== viewer.userId ||
          selection.workspaceId !== workspaceId ||
          selection.expiresAt < now()
        ) {
          return null;
        }
        return toSummary(selection);
      }
      return null;
    },
    consume: async (id, consumer) => {
    const result = await runUpstashCommand<string | null>([
      "GETDEL",
        selectionKey(consumer.userId, consumer.workspaceId, id),
    ]);
    if (!result) return null;
    const selection = JSON.parse(result) as PersistedSelection;
      if (
        selection.userId !== consumer.userId ||
        selection.workspaceId !== consumer.workspaceId ||
        selection.brandId !== consumer.brandId ||
        selection.expiresAt < now()
      ) {
        return null;
      }
    const accessToken = await getEncryptionService().decrypt(
      selection.encryptedAccessToken,
    );
    return {
      id: selection.id,
      workspaceId: selection.workspaceId,
      brandId: selection.brandId,
      returnTo: selection.returnTo,
      grant: { ...selection.grant, accessToken },
      assets: selection.assets,
    };
    },
  };
}

const mockMetaSelectionStore = createInMemoryMetaSelectionStore();

export function getMetaSelectionStore(): MetaSelectionStore {
  return getIntegrationMode() === "mock"
    ? mockMetaSelectionStore
    : createUpstashMetaSelectionStore();
}

export function createMetaSelection(input: MetaSelectionInput): Promise<string> {
  return getMetaSelectionStore().create(input);
}

export function getMetaSelection(
  id: string,
  viewer: MetaSelectionViewer,
): Promise<MetaSelectionSummary | null> {
  return getMetaSelectionStore().view(id, viewer);
}

export function consumeMetaSelection(
  id: string,
  consumer: MetaSelectionConsumer,
): Promise<MetaAssetSelectionSession | null> {
  return getMetaSelectionStore().consume(id, consumer);
}
