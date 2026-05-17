import type { Task } from "@/types/task";
import type { User, UserRole } from "@/types/user";

export type RolePermissions = {
  assignTasks: boolean;
  createProjects: boolean;
  editProjects: boolean;
  manageUsers: boolean;
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    assignTasks: true,
    createProjects: true,
    editProjects: true,
    manageUsers: true,
  },
  leader: {
    assignTasks: true,
    createProjects: false,
    editProjects: true,
    manageUsers: false,
  },
  member: {
    assignTasks: false,
    createProjects: false,
    editProjects: false,
    manageUsers: false,
  },
};

export function canCreateProject(role: UserRole) {
  return ROLE_PERMISSIONS[role].createProjects;
}

export function canManageUsers(role: UserRole) {
  return ROLE_PERMISSIONS[role].manageUsers;
}

export function canManageUserRole(viewer: User, targetUser: User) {
  return canManageUsers(viewer.role) && viewer.id !== targetUser.id;
}

export function canAssignTasks(role: UserRole) {
  return ROLE_PERMISSIONS[role].assignTasks;
}

export function canEditProject(role: UserRole) {
  return ROLE_PERMISSIONS[role].editProjects;
}

export function canMoveTask(user: User, task: Task) {
  return user.role === "admin" || user.role === "leader" || task.assignee.id === user.id;
}
