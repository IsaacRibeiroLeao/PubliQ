import {
  DEMO_BRAND,
  DEMO_MEDIA_UPLOAD,
  DEMO_USER,
  DEMO_WORKSPACE,
  DEMO_WORKSPACE_MEMBERSHIP,
} from "@/shared/demo-fixtures";
import type {
  Brand,
  MediaUpload,
  Profile,
  Workspace,
  WorkspaceMembership,
} from "@/shared/domain";

export interface DomainFixtureRepository {
  getCurrentUser: () => Profile;
  listWorkspaces: () => readonly Workspace[];
  listMemberships: () => readonly WorkspaceMembership[];
  listBrands: (workspaceId: string) => readonly Brand[];
  listMediaUploads: (workspaceId: string) => readonly MediaUpload[];
}

export const domainFixtureRepository: DomainFixtureRepository = {
  getCurrentUser: () => DEMO_USER,
  listWorkspaces: () => [DEMO_WORKSPACE],
  listMemberships: () => [DEMO_WORKSPACE_MEMBERSHIP],
  listBrands: (workspaceId) =>
    workspaceId === DEMO_WORKSPACE.id ? [DEMO_BRAND] : [],
  listMediaUploads: (workspaceId) =>
    workspaceId === DEMO_WORKSPACE.id ? [DEMO_MEDIA_UPLOAD] : [],
};
