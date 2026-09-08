import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/database.types";
import type { MetaConnectionStatus } from "@/shared/domain";

export interface MetaConnectionSummary {
  status: MetaConnectionStatus;
  pageId: string;
  instagramAccountId: string | null;
  adAccountId: string | null;
  tokenExpiresAt: string | null;
  lastValidatedAt: string | null;
}

export interface MetaConnectionRecord extends MetaConnectionSummary {
  workspaceId: string;
  brandId: string;
  scopes: string[];
  accessTokenCipher: string;
  accessTokenIv: string;
  accessTokenTag: string;
  keyVersion: number;
}

export interface MetaConnectionRepository {
  getStatus: (
    workspaceId: string,
    brandId: string,
  ) => Promise<MetaConnectionSummary | null>;
  save: (connection: MetaConnectionRecord) => Promise<MetaConnectionRecord>;
}

const mockConnections = new Map<string, MetaConnectionRecord>();

export function createMockMetaConnectionRepository(): MetaConnectionRepository {
  return {
    getStatus: async (workspaceId, brandId) => {
      const connection = mockConnections.get(`${workspaceId}:${brandId}`);
      if (!connection) return null;
      const {
        status,
        pageId,
        instagramAccountId,
        adAccountId,
        tokenExpiresAt,
        lastValidatedAt,
      } = connection;
      return {
        status,
        pageId,
        instagramAccountId,
        adAccountId,
        tokenExpiresAt,
        lastValidatedAt,
      };
    },
    save: async (connection) => {
      mockConnections.set(
        `${connection.workspaceId}:${connection.brandId}`,
        connection,
      );
      return connection;
    },
  };
}

export function createSupabaseMetaConnectionRepository(
  supabase: SupabaseClient<Database>,
): MetaConnectionRepository {
  return {
    getStatus: async (workspaceId, brandId) => {
      const { data, error } = await supabase
        .from("meta_connection_summaries")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("brand_id", brandId)
        .maybeSingle();
      if (error) throw error;
      if (!data?.status || !data.page_id) return null;
      return {
        status: data.status,
        pageId: data.page_id,
        instagramAccountId: data.instagram_account_id,
        adAccountId: data.ad_account_id,
        tokenExpiresAt: data.token_expires_at,
        lastValidatedAt: data.last_validated_at,
      };
    },
    save: async (connection) => {
      const { error } = await supabase.from("meta_connections").upsert(
        {
          workspace_id: connection.workspaceId,
          brand_id: connection.brandId,
          status: connection.status,
          access_token_cipher: connection.accessTokenCipher,
          access_token_iv: connection.accessTokenIv,
          access_token_tag: connection.accessTokenTag,
          key_version: connection.keyVersion,
          token_expires_at: connection.tokenExpiresAt,
          scopes: connection.scopes,
          page_id: connection.pageId,
          instagram_account_id: connection.instagramAccountId,
          ad_account_id: connection.adAccountId,
          last_validated_at: connection.lastValidatedAt,
        },
        { onConflict: "brand_id" },
      );
      if (error) throw error;
      return connection;
    },
  };
}
