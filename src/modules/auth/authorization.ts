import type { WorkspaceRole } from "@/shared/domain";

const ROLE_LEVEL: Record<WorkspaceRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export interface WorkspaceRoleRequirement {
  minimumRole?: WorkspaceRole;
  allowedRoles?: readonly WorkspaceRole[];
}

export class AuthorizationError extends Error {
  constructor(message = "Workspace role is not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function assertWorkspaceRole(
  role: WorkspaceRole,
  requirement: WorkspaceRoleRequirement = {},
): void {
  if (
    requirement.minimumRole &&
    ROLE_LEVEL[role] < ROLE_LEVEL[requirement.minimumRole]
  ) {
    throw new AuthorizationError();
  }

  if (
    requirement.allowedRoles &&
    !requirement.allowedRoles.includes(role)
  ) {
    throw new AuthorizationError();
  }
}
