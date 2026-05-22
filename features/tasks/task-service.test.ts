import { describe, expect, it } from "vitest";
import { getChecklistProgress, getTasksByStatus } from "./task-service";
import type { ChecklistItem } from "../../types/checklist";
import type { Task, TaskStatus } from "../../types/task";
import type { User } from "../../types/user";

const assignee: User = {
  id: "user-1",
  name: "Event User",
  email: "event.user@pcns.org",
  role: "member",
  department: "Events",
};

describe("getTasksByStatus", () => {
  it("returns only tasks matching the requested status", () => {
    const tasks = [
      createTask("task-1", "todo"),
      createTask("task-2", "in_progress"),
      createTask("task-3", "done"),
      createTask("task-4", "todo"),
    ];

    expect(getTasksByStatus(tasks, "todo").map((task) => task.id)).toEqual(["task-1", "task-4"]);
  });
});

describe("getChecklistProgress", () => {
  it("returns zero for an empty checklist", () => {
    expect(getChecklistProgress([])).toBe(0);
  });

  it("rounds completed checklist progress to the nearest percentage", () => {
    expect(getChecklistProgress([createChecklistItem("1", true), createChecklistItem("2", false)])).toBe(50);
    expect(
      getChecklistProgress([
        createChecklistItem("1", true),
        createChecklistItem("2", false),
        createChecklistItem("3", false),
      ]),
    ).toBe(33);
  });

  it("returns full progress when every item is complete", () => {
    expect(getChecklistProgress([createChecklistItem("1", true), createChecklistItem("2", true)])).toBe(100);
  });
});

function createTask(id: string, status: TaskStatus): Task {
  return {
    id,
    projectId: "project-1",
    title: id,
    description: "Task description",
    category: "event_preparation",
    status,
    priority: "medium",
    dueDate: "2026-06-01",
    assignee,
    checklist: [],
    comments: [],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
}

function createChecklistItem(id: string, completed: boolean): ChecklistItem {
  return {
    id,
    taskId: "task-1",
    label: `Checklist ${id}`,
    completed,
    completedAt: completed ? "2026-05-01T00:00:00.000Z" : undefined,
  };
}
