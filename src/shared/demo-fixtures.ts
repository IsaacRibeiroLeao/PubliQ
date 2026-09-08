import type {
  Brand,
  MediaUpload,
  Profile,
  Workspace,
  WorkspaceMembership,
} from "@/shared/domain";

const DEMO_TIMESTAMP = "2026-01-15T12:00:00.000Z";

export const DEMO_USER: Profile = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@publiq.local",
  name: "Isaac Demo",
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
};

export const DEMO_WORKSPACE: Workspace = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "Agência PubliQ Demo",
  timezone: "America/Sao_Paulo",
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
};

export const DEMO_WORKSPACE_MEMBERSHIP: WorkspaceMembership = {
  workspaceId: DEMO_WORKSPACE.id,
  userId: DEMO_USER.id,
  role: "OWNER",
  createdAt: DEMO_TIMESTAMP,
};

export const DEMO_BRAND: Brand = {
  id: "00000000-0000-4000-8000-000000000003",
  workspaceId: DEMO_WORKSPACE.id,
  name: "Café Aurora",
  niche: "Cafeteria artesanal",
  valueProposition: "Café especial brasileiro, simples e acolhedor.",
  persona: {
    name: "Marina",
    goal: "descobrir cafés de origem sem complicação",
  },
  targetAudience: "Adultos de 25 a 45 anos interessados em café especial",
  toneOfVoice: "Próximo, otimista e direto",
  voiceExamples: ["Seu café de todo dia pode ter uma origem extraordinária."],
  forbiddenWords: ["imperdível", "milagre"],
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
};

export const DEMO_MEDIA_UPLOAD: MediaUpload = {
  id: "00000000-0000-4000-8000-000000000004",
  workspaceId: DEMO_WORKSPACE.id,
  brandId: DEMO_BRAND.id,
  uploadedById: DEMO_USER.id,
  storageBucket: "media",
  storageKey: `${DEMO_WORKSPACE.id}/${DEMO_BRAND.id}/00000000-0000-4000-8000-000000000004/demo-cafe.jpg`,
  originalName: "demo-cafe.jpg",
  mimeType: "image/jpeg",
  byteSize: 245760,
  checksumSha256:
    "dd7d8f969cab5168b61471c8fdca0767d3709d0c1fa110e766d5c43448f49831",
  status: "ready",
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
};
