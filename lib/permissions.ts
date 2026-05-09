import type { Task } from "@/types/task";
import type { User, UserRole } from "@/types/user";

export function canCreateProject(role: UserRole) {
  return role === "admin";
}

export function canManageUsers(role: UserRole) {
  return role === "admin";
}

export function canAssignTasks(role: UserRole) {
  return role === "admin" || role === "leader";
}

export function canEditProject(role: UserRole) {
  return role === "admin" || role === "leader";
}

export function canMoveTask(user: User, task: Task) {
  return user.role === "admin" || user.role === "leader" || task.assignee.id === user.id;
}

