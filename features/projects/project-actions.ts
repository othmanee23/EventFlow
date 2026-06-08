"use server";

import { revalidatePath } from "next/cache";
import { mapDatabaseProjectToProject } from "@/features/projects/project-mappers";
import { projectInclude } from "@/features/projects/project-service";
import {
  hasCreateProjectErrors,
  slugify,
  validateCreateProjectInput,
  type CreateProjectInput,
  type CreateProjectErrors,
} from "@/features/projects/project-utils";
import { getRequiredSession } from "@/features/auth/auth-service";
import { DEFAULT_TASK_CATEGORIES, TASK_CATEGORIES } from "@/lib/constants";
import { canCreateProject } from "@/lib/permissions";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import { TaskCategory, TaskPriority, TaskStatus } from "@/prisma/generated/prisma/enums";
import type { Project } from "@/types/project";
import type { TaskCategory as DomainTaskCategory } from "@/types/task";

type CreateProjectActionResult =
  | {
      errors?: never;
      message?: string;
      persisted: true;
      project: Project;
      success: true;
    }
  | {
      errors?: CreateProjectErrors;
      message: string;
      persisted: false;
      project?: never;
      reason: "database_not_configured" | "invalid_input" | "invalid_users" | "forbidden" | "database_error";
      success: false;
    };

const TASK_CATEGORY_TO_DATABASE: Record<DomainTaskCategory, TaskCategory> = {
  event_preparation: TaskCategory.EVENT_PREPARATION,
  participants: TaskCategory.PARTICIPANTS,
  communication: TaskCategory.COMMUNICATION,
  logistics: TaskCategory.LOGISTICS,
  audiovisual_production: TaskCategory.AUDIOVISUAL_PRODUCTION,
  post_event: TaskCategory.POST_EVENT,
};

export async function createProjectAction(input: CreateProjectInput): Promise<CreateProjectActionResult> {
  const errors = validateCreateProjectInput(input);

  if (hasCreateProjectErrors(errors)) {
    return {
      success: false,
      persisted: false,
      reason: "invalid_input",
      message: "Check the highlighted fields and try again.",
      errors,
    };
  }

  const session = await getRequiredSession();

  if (!canCreateProject(session.user.role)) {
    return {
      success: false,
      persisted: false,
      reason: "forbidden",
      message: "You do not have permission to create projects.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    const databaseMessage = shouldUseMockFallback()
      ? "No database is configured, so the project was created locally for this session."
      : "Database access is required in this environment. Configure DATABASE_URL and try again.";

    return {
      success: false,
      persisted: false,
      reason: "database_not_configured",
      message: databaseMessage,
    };
  }

  const memberIds = [...new Set(input.memberIds.filter((memberId) => memberId !== input.leaderId))];
  const selectedUserIds = [input.leaderId, ...memberIds];

  try {
    const selectedUsers = await prisma.user.findMany({
      where: {
        id: {
          in: selectedUserIds,
        },
      },
      select: {
        id: true,
      },
    });
    const existingUserIds = new Set(selectedUsers.map((user) => user.id));

    if (!existingUserIds.has(input.leaderId)) {
      return {
        success: false,
        persisted: false,
        reason: "invalid_users",
        message: "Selected leader was not found in the database.",
        errors: {
          leaderId: "Select a database user as leader.",
        },
      };
    }

    const validMemberIds = memberIds.filter((memberId) => existingUserIds.has(memberId));
    const projectSlug = await createUniqueProjectSlug(input.name);
    const startDate = createDateFromInput(input.startDate);
    const endDate = createDateFromInput(input.endDate);

    const project = await prisma.project.create({
      data: {
        slug: projectSlug,
        name: input.name.trim(),
        description: input.description.trim(),
        status: "PLANNING",
        startDate,
        endDate,
        leaderId: input.leaderId,
        members: {
          create: validMemberIds.map((userId) => ({
            userId,
          })),
        },
        tasks: {
          create: DEFAULT_TASK_CATEGORIES.map((category) => ({
            title: TASK_CATEGORIES[category],
            description: `Initial ${TASK_CATEGORIES[category].toLowerCase()} task for this event project.`,
            category: TASK_CATEGORY_TO_DATABASE[category],
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            dueDate: endDate,
            assignments: {
              create: [
                {
                  userId: input.leaderId,
                },
              ],
            },
          })),
        },
      },
      include: projectInclude,
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return {
      success: true,
      persisted: true,
      project: mapDatabaseProjectToProject(project),
    };
  } catch (error) {
    console.error("Project creation failed.", error);

    return {
      success: false,
      persisted: false,
      reason: "database_error",
      message: "Project creation failed. Check the database configuration and try again.",
    };
  }
}

async function createUniqueProjectSlug(name: string) {
  const prisma = getPrisma();
  const baseSlug = slugify(name);

  if (!prisma) {
    return baseSlug;
  }

  const existingProjects = await prisma.project.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: {
      slug: true,
    },
  });
  const existingSlugs = new Set(existingProjects.map((project) => project.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function createDateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
