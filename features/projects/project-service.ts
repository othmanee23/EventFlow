import { mapDatabaseProjectToProject } from "@/features/projects/project-mappers";
import { mockProjects } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
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

  if (!prisma) {
    return mockProjects;
  }

  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: {
        eventDate: "asc",
      },
    });

    return projects.length > 0 ? projects.map(mapDatabaseProjectToProject) : mockProjects;
  } catch (error) {
    console.warn("Falling back to mock projects because the database read failed.", error);
    return mockProjects;
  }
}

export async function getProjectById(projectId: string): Promise<Project | undefined> {
  const prisma = getPrisma();

  if (!prisma) {
    return mockProjects.find((project) => project.id === projectId);
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      include: projectInclude,
    });

    return project
      ? mapDatabaseProjectToProject(project)
      : mockProjects.find((mockProject) => mockProject.id === projectId);
  } catch (error) {
    console.warn("Falling back to mock project lookup because the database read failed.", error);
    return mockProjects.find((project) => project.id === projectId);
  }
}

export function getMockProjects(): Project[] {
  return mockProjects;
}
