import { describe, expect, it } from "vitest";
import {
  canAssignTasks,
  canCreateProject,
  canManageUsers,
  canMoveTask,
  canUpdateAssignedTask,
} from "./permissions";
import type { Task } from "../types/task";
import type { User } from "../types/user";

const admin = createUser("admin-user", "admin");
const leader = createUser("leader-user", "leader");
const assignedMember = createUser("assigned-member", "member");
const otherMember = createUser("other-member", "member");

describe("role permissions", () => {
  it("allows only admins to create projects and manage users", () => {
    expect(canCreateProject("admin")).toBe(true);
    expect(canCreateProject("leader")).toBe(false);
    expect(canCreateProject("member")).toBe(false);

    expect(canManageUsers("admin")).toBe(true);
    expect(canManageUsers("leader")).toBe(false);
    expect(canManageUsers("member")).toBe(false);
  });

  it("allows admins and leaders to assign tasks", () => {
    expect(canAssignTasks("admin")).toBe(true);
    expect(canAssignTasks("leader")).toBe(true);
    expect(canAssignTasks("member")).toBe(false);
  });
});

describe("task update permissions", () => {
  it("allows admins and leaders to update any assigned task", () => {
    expect(canUpdateAssignedTask(admin, [assignedMember.id])).toBe(true);
    expect(canUpdateAssignedTask(leader, [assignedMember.id])).toBe(true);
  });

  it("allows members to update only their assigned tasks", () => {
    expect(canUpdateAssignedTask(assignedMember, [assignedMember.id])).toBe(true);
    expect(canUpdateAssignedTask(otherMember, [assignedMember.id])).toBe(false);
  });

  it("uses the same rules for Kanban task movement", () => {
    const task = createTask(assignedMember);

    expect(canMoveTask(admin, task)).toBe(true);
    expect(canMoveTask(leader, task)).toBe(true);
    expect(canMoveTask(assignedMember, task)).toBe(true);
    expect(canMoveTask(otherMember, task)).toBe(false);
  });
});

function createUser(id: string, role: User["role"]): User {
  return {
    id,
    name: id,
    email: `${id}@pcns.org`,
    role,
    department: "Events",
  };
}

function createTask(assignee: User): Task {
  return {
    id: "task-1",
    projectId: "project-1",
    title: "Task",
    description: "Task description",
    category: "event_preparation",
    status: "todo",
    priority: "medium",
    dueDate: "2026-06-01",
    assignees: [assignee],
    checklist: [],
    comments: [],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
}
