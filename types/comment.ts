import type { User } from "@/types/user";

export type Comment = {
  id: string;
  taskId: string;
  author: User;
  body: string;
  createdAt: string;
};

