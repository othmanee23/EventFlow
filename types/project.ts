import type { Task } from "@/types/task";
import type { User } from "@/types/user";

export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  leader: User;
  members: User[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
};
