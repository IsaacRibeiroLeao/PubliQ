import { getIntegrationMode } from "@/shared/integration-mode";

export interface MetaOAuthGrant {
  accessToken: string;
  expiresAt: string | null;
  scopes: string[];
}

export interface MetaAsset {
  pageId: string;
  pageName: string;
  instagramAccountId: string | null;
  instagramAccountName: string | null;
  adAccountIds: string[];
}

export interface MetaProvider {
  getAuthorizationUrl: (input: {
    state: string;
    redirectUri: string;
  }) => string;
  exchangeCode: (input: {
    code: string;
    redirectUri: string;
  }) => Promise<MetaOAuthGrant>;
  listAssets: (accessToken: string) => Promise<readonly MetaAsset[]>;
}

export interface MetaAssetSelectionSession {
  id: string;
  workspaceId: string;
  brandId: string;
  returnTo: string;
  grant: MetaOAuthGrant;
  assets: readonly MetaAsset[];
}

const mockProvider: MetaProvider = {
  getAuthorizationUrl: ({ state, redirectUri }) => {
    const params = new URLSearchParams({ state, redirect_uri: redirectUri });
    return `/app/meta/callback?code=mock-code&${params.toString()}`;
  },
  exchangeCode: async () => ({
    accessToken: "mock-meta-token-never-sent-to-client",
    expiresAt: "2026-12-31T23:59:59.000Z",
    scopes: ["pages_show_list", "instagram_basic", "ads_management"],
  }),
  listAssets: async () => [
    {
      pageId: "page-cafe-aurora",
      pageName: "Café Aurora",
      instagramAccountId: "instagram-cafe-aurora",
      instagramAccountName: "@cafeaurora",
      adAccountIds: ["act_123456789"],
    },
  ],
};

function createRealMetaProvider(): MetaProvider {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const graphVersion = process.env.META_GRAPH_VERSION ?? "v23.0";
  if (!appId || !appSecret) {
    throw new Error("A integração Meta não está configurada.");
  }

  return {
    getAuthorizationUrl: ({ state, redirectUri }) => {
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        state,
        response_type: "code",
        scope: "pages_show_list,pages_read_engagement,instagram_basic,ads_management",
      });
      return `https://www.facebook.com/${graphVersion}/dialog/oauth?${params}`;
    },
    exchangeCode: async ({ code, redirectUri }) => {
      const params = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      });
      const response = await fetch(
        `https://graph.facebook.com/${graphVersion}/oauth/access_token?${params}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error("Meta OAuth exchange failed");
      }
      const result = (await response.json()) as {
        access_token: string;
        expires_in?: number;
      };
      return {
        accessToken: result.access_token,
        expiresAt: result.expires_in
          ? new Date(Date.now() + result.expires_in * 1000).toISOString()
          : null,
        scopes: [
          "pages_show_list",
          "pages_read_engagement",
          "instagram_basic",
          "ads_management",
        ],
      };
    },
    listAssets: async (accessToken) => {
      const pageParams = new URLSearchParams({
        fields:
          "id,name,instagram_business_account{id,username},access_token",
        access_token: accessToken,
      });
      const adParams = new URLSearchParams({
        fields: "id",
        access_token: accessToken,
      });
      const [pageResponse, adResponse] = await Promise.all([
        fetch(
          `https://graph.facebook.com/${graphVersion}/me/accounts?${pageParams}`,
          { cache: "no-store" },
        ),
        fetch(
          `https://graph.facebook.com/${graphVersion}/me/adaccounts?${adParams}`,
          { cache: "no-store" },
        ),
      ]);
      if (!pageResponse.ok || !adResponse.ok) {
        throw new Error("Meta asset lookup failed");
      }
      const [pages, adAccounts] = (await Promise.all([
        pageResponse.json(),
        adResponse.json(),
      ])) as [
        {
          data: Array<{
            id: string;
            name: string;
            instagram_business_account?: { id: string; username?: string };
          }>;
        },
        { data: Array<{ id: string }> },
      ];
      return pages.data.map((page) => ({
        pageId: page.id,
        pageName: page.name,
        instagramAccountId: page.instagram_business_account?.id ?? null,
        instagramAccountName:
          page.instagram_business_account?.username ?? null,
        adAccountIds: adAccounts.data.map((account) => account.id),
      }));
    },
  };
}

export function getMetaProvider(): MetaProvider {
  return getIntegrationMode() === "mock"
    ? mockProvider
    : createRealMetaProvider();
}
