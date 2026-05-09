import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: "user-admin",
    name: "Nadia El Amrani",
    email: "nadia.elamrani@pcns.org",
    role: "admin",
    department: "Events",
  },
  {
    id: "user-leader",
    name: "Youssef Bennani",
    email: "youssef.bennani@pcns.org",
    role: "leader",
    department: "Events",
  },
  {
    id: "user-member",
    name: "Salma Alaoui",
    email: "salma.alaoui@pcns.org",
    role: "member",
    department: "Communications",
  },
  {
    id: "user-av",
    name: "Mehdi Tazi",
    email: "mehdi.tazi@pcns.org",
    role: "member",
    department: "Audiovisual",
  },
];

export const currentUser = mockUsers[0];

export const mockProjects: Project[] = [
  {
    id: "atlantic-dialogues-2026",
    name: "Atlantic Dialogues 2026",
    description: "Annual flagship conference preparation and coordination.",
    status: "active",
    eventDate: "2026-12-10",
    leader: mockUsers[1],
    members: [mockUsers[2], mockUsers[3]],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-05-05T16:30:00.000Z",
    tasks: [
      {
        id: "task-1",
        projectId: "atlantic-dialogues-2026",
        title: "Confirm event preparation timeline",
        description: "Review milestones and align owners for the full preparation cycle.",
        category: "event_preparation",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-06-15",
        assignee: mockUsers[1],
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-05-07T09:15:00.000Z",
        checklist: [
          {
            id: "check-1",
            taskId: "task-1",
            label: "Draft timeline",
            completed: true,
            completedAt: "2026-04-18T12:00:00.000Z",
          },
          {
            id: "check-2",
            taskId: "task-1",
            label: "Validate owners",
            completed: false,
          },
        ],
        comments: [
          {
            id: "comment-1",
            taskId: "task-1",
            author: mockUsers[0],
            body: "Keep this aligned with the internal steering committee calendar.",
            createdAt: "2026-05-01T14:00:00.000Z",
          },
        ],
      },
      {
        id: "task-2",
        projectId: "atlantic-dialogues-2026",
        title: "Prepare participant invitation list",
        description: "Consolidate invitees, affiliations, and priority notes.",
        category: "participants",
        status: "todo",
        priority: "medium",
        dueDate: "2026-07-01",
        assignee: mockUsers[2],
        createdAt: "2026-04-03T11:00:00.000Z",
        updatedAt: "2026-04-22T15:45:00.000Z",
        checklist: [
          {
            id: "check-3",
            taskId: "task-2",
            label: "Collect prior year participant list",
            completed: false,
          },
        ],
        comments: [],
      },
      {
        id: "task-3",
        projectId: "atlantic-dialogues-2026",
        title: "Book audiovisual production team",
        description: "Reserve video, sound, lighting, and streaming coverage.",
        category: "audiovisual_production",
        status: "done",
        priority: "medium",
        dueDate: "2026-05-30",
        assignee: mockUsers[3],
        createdAt: "2026-04-04T09:30:00.000Z",
        updatedAt: "2026-05-03T17:00:00.000Z",
        checklist: [
          {
            id: "check-4",
            taskId: "task-3",
            label: "Confirm vendor availability",
            completed: true,
            completedAt: "2026-05-02T17:00:00.000Z",
          },
        ],
        comments: [],
      },
    ],
  },
  {
    id: "policy-roundtable-climate",
    name: "Climate Policy Roundtable",
    description: "Focused policy convening for regional climate financing.",
    status: "planning",
    eventDate: "2026-09-18",
    leader: mockUsers[1],
    members: [mockUsers[2]],
    tasks: [],
    createdAt: "2026-04-20T09:00:00.000Z",
    updatedAt: "2026-05-02T12:30:00.000Z",
  },
];

