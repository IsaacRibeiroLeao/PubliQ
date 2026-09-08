import { assertWorkspaceRole, AuthorizationError } from "@/modules/auth/authorization";
import {
  DEMO_USER,
  DEMO_WORKSPACE_MEMBERSHIP,
} from "@/shared/demo-fixtures";
import type {
  AppSession,
  WorkspaceMembership,
  WorkspaceRole,
} from "@/shared/domain";
import { getIntegrationMode } from "@/shared/integration-mode";

export class AuthenticationError extends Error {
  constructor(message = "Authentication is required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class WorkspaceAccessError extends Error {
  constructor(message = "Workspace access is denied") {
    super(message);
    this.name = "WorkspaceAccessError";
  }
}

interface SessionServiceDependencies {
  getSession: () => Promise<AppSession | null>;
  findMembership: (
    userId: string,
    workspaceId: string,
  ) => Promise<WorkspaceMembership | null>;
}

export interface SessionService {
  requireSession: () => Promise<AppSession>;
  requireWorkspaceAccess: (
    workspaceId: string,
    roles?: readonly WorkspaceRole[],
  ) => Promise<WorkspaceMembership>;
}

export function createSessionService(
  dependencies: SessionServiceDependencies,
): SessionService {
  async function requireSession(): Promise<AppSession> {
    const session = await dependencies.getSession();

    if (!session) {
      throw new AuthenticationError();
    }

    return session;
  }

  async function requireWorkspaceAccess(
    workspaceId: string,
    roles?: readonly WorkspaceRole[],
  ): Promise<WorkspaceMembership> {
    const session = await requireSession();
    const membership = await dependencies.findMembership(
      session.user.id,
      workspaceId,
    );

    if (
      !membership ||
      membership.workspaceId !== workspaceId ||
      membership.userId !== session.user.id
    ) {
      throw new WorkspaceAccessError();
    }

    try {
      assertWorkspaceRole(membership.role, { allowedRoles: roles });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw new WorkspaceAccessError();
      }
      throw error;
    }

    return membership;
  }

  return { requireSession, requireWorkspaceAccess };
}

export async function getCurrentSession(): Promise<AppSession | null> {
  if (getIntegrationMode() === "mock") {
    return {
      user: DEMO_USER,
      memberships: [DEMO_WORKSPACE_MEMBERSHIP],
    };
  }

  const { createServerSupabaseClient } = await import(
    "@/integrations/supabase/server"
  );
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [profileResult, membershipsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("workspace_members")
      .select("*")
      .eq("user_id", user.id),
  ]);

  if (
    profileResult.error ||
    membershipsResult.error ||
    !profileResult.data
  ) {
    return null;
  }

  return {
    user: {
      id: profileResult.data.id,
      email: profileResult.data.email,
      name: profileResult.data.name,
      createdAt: profileResult.data.created_at,
      updatedAt: profileResult.data.updated_at,
    },
    memberships: membershipsResult.data.map((membership) => ({
      workspaceId: membership.workspace_id,
      userId: membership.user_id,
      role: membership.role,
      createdAt: membership.created_at,
    })),
  };
}

async function findCurrentMembership(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceMembership | null> {
  if (getIntegrationMode() === "mock") {
    return userId === DEMO_USER.id &&
      workspaceId === DEMO_WORKSPACE_MEMBERSHIP.workspaceId
      ? DEMO_WORKSPACE_MEMBERSHIP
      : null;
  }

  const { createServerSupabaseClient } = await import(
    "@/integrations/supabase/server"
  );
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    workspaceId: data.workspace_id,
    userId: data.user_id,
    role: data.role,
    createdAt: data.created_at,
  };
}

const sessionService = createSessionService({
  getSession: getCurrentSession,
  findMembership: findCurrentMembership,
});

export const requireSession = sessionService.requireSession;
export const requireWorkspaceAccess = sessionService.requireWorkspaceAccess;
