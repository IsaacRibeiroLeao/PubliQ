import { requireSession, WorkspaceAccessError } from "@/modules/auth/session";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { DEMO_WORKSPACE } from "@/shared/demo-fixtures";
import type {
  AppSession,
  Profile,
  Workspace,
  WorkspaceMembership,
} from "@/shared/domain";
import { getIntegrationMode } from "@/shared/integration-mode";

export interface CurrentWorkspaceContext {
  user: Profile;
  membership: WorkspaceMembership;
  workspace: Workspace;
}

export async function resolveCurrentWorkspaceContext(
  session: AppSession,
  findWorkspace: (workspaceId: string) => Promise<Workspace | null>,
): Promise<CurrentWorkspaceContext> {
  const membership = session.memberships[0];
  if (!membership) {
    throw new WorkspaceAccessError("Nenhum workspace disponível.");
  }
  const workspace = await findWorkspace(membership.workspaceId);
  if (!workspace) {
    throw new WorkspaceAccessError("Workspace não encontrado.");
  }
  return { user: session.user, membership, workspace };
}

async function findCurrentWorkspace(
  workspaceId: string,
): Promise<Workspace | null> {
  if (getIntegrationMode() === "mock") {
    return workspaceId === DEMO_WORKSPACE.id ? DEMO_WORKSPACE : null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  return data
    ? {
        id: data.id,
        name: data.name,
        timezone: data.timezone,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    : null;
}

export async function getCurrentWorkspaceContext(
  session?: AppSession,
): Promise<CurrentWorkspaceContext> {
  return resolveCurrentWorkspaceContext(
    session ?? (await requireSession()),
    findCurrentWorkspace,
  );
}
