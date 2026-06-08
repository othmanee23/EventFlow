import { mapDatabaseProjectToProject } from "@/features/projects/project-mappers";
import { mockProjects } from "@/lib/mock-data";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export const projectInclude = {
  leader: true,
  members: {
    include: {
      user: true,
    },
  },
  tasks: {
    include: {
      assignments: {
        include: {
          user: true,
        },
      },
      checklist: {
        orderBy: {
          createdAt: "asc",
        },
      },
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

export async function getProjects(viewer?: Pick<User, "id" | "role">): Promise<Project[]> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? filterProjectsForViewer(mockProjects, viewer) : [];
  }

  try {
    const where = buildProjectAccessWhere(viewer);
    const projects = await prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: {
        startDate: "asc",
      },
    });

    return projects.length > 0
      ? projects.map(mapDatabaseProjectToProject)
      : useMockFallback
        ? filterProjectsForViewer(mockProjects, viewer)
        : [];
  } catch (error) {
    console.warn("Project list lookup failed.", error);
    return useMockFallback ? filterProjectsForViewer(mockProjects, viewer) : [];
  }
}

export async function getProjectById(
  projectId: string,
  viewer?: Pick<User, "id" | "role">,
): Promise<Project | undefined> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? filterProjectsForViewer(mockProjects, viewer).find((project) => project.id === projectId) : undefined;
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        AND: [
          { OR: [{ id: projectId }, { slug: projectId }] },
          buildProjectAccessWhere(viewer),
        ],
      },
      include: projectInclude,
    });

    if (project) {
      return mapDatabaseProjectToProject(project);
    }

    return useMockFallback
      ? filterProjectsForViewer(mockProjects, viewer).find((mockProject) => mockProject.id === projectId)
      : undefined;
  } catch (error) {
    console.warn("Project by id lookup failed.", error);
    return useMockFallback
      ? filterProjectsForViewer(mockProjects, viewer).find((project) => project.id === projectId)
      : undefined;
  }
}

export function getMockProjects(): Project[] {
  return mockProjects;
}

function buildProjectAccessWhere(viewer?: Pick<User, "id" | "role">) {
  if (!viewer || viewer.role !== "member") {
    return {};
  }

  return {
    OR: [
      {
        leaderId: viewer.id,
      },
      {
        members: {
          some: {
            userId: viewer.id,
          },
        },
      },
      {
        tasks: {
          some: {
            assignments: {
              some: {
                userId: viewer.id,
              },
            },
          },
        },
      },
    ],
  };
}

function filterProjectsForViewer(projects: Project[], viewer?: Pick<User, "id" | "role">) {
  if (!viewer || viewer.role !== "member") {
    return projects;
  }

  return projects.filter(
    (project) =>
      project.leader.id === viewer.id ||
      project.members.some((member) => member.id === viewer.id) ||
      project.tasks.some((task) => task.assignees.some((assignee) => assignee.id === viewer.id)),
  );
}
