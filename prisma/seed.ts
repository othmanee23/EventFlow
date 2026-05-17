import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { mockProjects, mockUsers } from "../lib/mock-data";
import { PrismaClient } from "./generated/prisma/client";
import {
  ProjectStatus,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "./generated/prisma/enums";
import type { ProjectStatus as DomainProjectStatus } from "../types/project";
import type {
  TaskCategory as DomainTaskCategory,
  TaskPriority as DomainTaskPriority,
  TaskStatus as DomainTaskStatus,
} from "../types/task";
import type { UserRole as DomainUserRole } from "../types/user";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const USER_ROLE_TO_DATABASE: Record<DomainUserRole, UserRole> = {
  admin: UserRole.ADMIN,
  leader: UserRole.LEADER,
  member: UserRole.MEMBER,
};

const PROJECT_STATUS_TO_DATABASE: Record<DomainProjectStatus, ProjectStatus> = {
  planning: ProjectStatus.PLANNING,
  active: ProjectStatus.ACTIVE,
  completed: ProjectStatus.COMPLETED,
  on_hold: ProjectStatus.ON_HOLD,
};

const TASK_STATUS_TO_DATABASE: Record<DomainTaskStatus, TaskStatus> = {
  todo: TaskStatus.TODO,
  in_progress: TaskStatus.IN_PROGRESS,
  done: TaskStatus.DONE,
};

const TASK_CATEGORY_TO_DATABASE: Record<DomainTaskCategory, TaskCategory> = {
  event_preparation: TaskCategory.EVENT_PREPARATION,
  participants: TaskCategory.PARTICIPANTS,
  communication: TaskCategory.COMMUNICATION,
  logistics: TaskCategory.LOGISTICS,
  audiovisual_production: TaskCategory.AUDIOVISUAL_PRODUCTION,
  post_event: TaskCategory.POST_EVENT,
};

const TASK_PRIORITY_TO_DATABASE: Record<DomainTaskPriority, TaskPriority> = {
  low: TaskPriority.LOW,
  medium: TaskPriority.MEDIUM,
  high: TaskPriority.HIGH,
};

async function main() {
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        name: user.name,
        email: user.email,
        role: USER_ROLE_TO_DATABASE[user.role],
        department: user.department,
        avatarUrl: user.avatarUrl ?? null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: USER_ROLE_TO_DATABASE[user.role],
        department: user.department,
        avatarUrl: user.avatarUrl ?? null,
      },
    });
  }

  for (const project of mockProjects) {
    const seededProject = await prisma.project.upsert({
      where: {
        slug: project.id,
      },
      update: {
        name: project.name,
        description: project.description,
        status: PROJECT_STATUS_TO_DATABASE[project.status],
        eventDate: createDate(project.eventDate),
        leaderId: project.leader.id,
      },
      create: {
        id: project.id,
        slug: project.id,
        name: project.name,
        description: project.description,
        status: PROJECT_STATUS_TO_DATABASE[project.status],
        eventDate: createDate(project.eventDate),
        leaderId: project.leader.id,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      },
    });

    for (const member of project.members) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: seededProject.id,
            userId: member.id,
          },
        },
        update: {},
        create: {
          projectId: seededProject.id,
          userId: member.id,
        },
      });
    }

    for (const task of project.tasks) {
      await prisma.task.upsert({
        where: {
          id: task.id,
        },
        update: {
          projectId: seededProject.id,
          title: task.title,
          description: task.description,
          category: TASK_CATEGORY_TO_DATABASE[task.category],
          status: TASK_STATUS_TO_DATABASE[task.status],
          priority: TASK_PRIORITY_TO_DATABASE[task.priority],
          dueDate: createDate(task.dueDate),
          assigneeId: task.assignee.id,
        },
        create: {
          id: task.id,
          projectId: seededProject.id,
          title: task.title,
          description: task.description,
          category: TASK_CATEGORY_TO_DATABASE[task.category],
          status: TASK_STATUS_TO_DATABASE[task.status],
          priority: TASK_PRIORITY_TO_DATABASE[task.priority],
          dueDate: createDate(task.dueDate),
          assigneeId: task.assignee.id,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        },
      });

      for (const item of task.checklist) {
        await prisma.checklistItem.upsert({
          where: {
            id: item.id,
          },
          update: {
            label: item.label,
            completed: item.completed,
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
          },
          create: {
            id: item.id,
            taskId: task.id,
            label: item.label,
            completed: item.completed,
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
          },
        });
      }

      for (const comment of task.comments) {
        await prisma.comment.upsert({
          where: {
            id: comment.id,
          },
          update: {
            body: comment.body,
            authorId: comment.author.id,
          },
          create: {
            id: comment.id,
            taskId: task.id,
            authorId: comment.author.id,
            body: comment.body,
            createdAt: new Date(comment.createdAt),
          },
        });
      }
    }
  }

  console.log(`Seeded ${mockUsers.length} users and ${mockProjects.length} projects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function createDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
