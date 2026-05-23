import { mapDatabaseProjectToProject } from "@/features/projects/project-mappers";
import { mockProjects } from "@/lib/mock-data";
import { getPrisma, shouldUseMockFallback } from "@/lib/prisma";
import type { Project } from "@/types/project";

export const projectInclude = {
  leader: true,
  members: {
    include: {
      user: true,
    },
  },
  tasks: {
    include: {
      assignee: true,
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

export async function getProjects(): Promise<Project[]> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? mockProjects : [];
  }

  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: {
        eventDate: "asc",
      },
    });

    return projects.length > 0 ? projects.map(mapDatabaseProjectToProject) : useMockFallback ? mockProjects : [];
  } catch (error) {
    console.warn("Project list lookup failed.", error);
    return useMockFallback ? mockProjects : [];
  }
}

export async function getProjectById(projectId: string): Promise<Project | undefined> {
  const prisma = getPrisma();
  const useMockFallback = shouldUseMockFallback();

  if (!prisma) {
    return useMockFallback ? mockProjects.find((project) => project.id === projectId) : undefined;
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      include: projectInclude,
    });

    if (project) {
      return mapDatabaseProjectToProject(project);
    }

    return useMockFallback ? mockProjects.find((mockProject) => mockProject.id === projectId) : undefined;
  } catch (error) {
    console.warn("Project by id lookup failed.", error);
    return useMockFallback ? mockProjects.find((project) => project.id === projectId) : undefined;
  }
}

export function getMockProjects(): Project[] {
  return mockProjects;
}
