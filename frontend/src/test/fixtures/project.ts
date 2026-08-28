import type { Project, ProjectWithTeam } from "@/lib/project-types";

export const projectExisting: Project = {
  id: 1,
  name: "Existing project",
  description: "Some description",
  createdAt: "2024-06-01T00:00:00.000Z",
};

export const projectWithTeamAlpha: ProjectWithTeam = {
  id: 7,
  name: "Alpha",
  description: "A longer description that may be truncated in the table cell for layout",
  createdAt: "2024-03-15T12:00:00.000Z",
  memberCount: 2,
  teamPreview: [
    { id: 1, name: "A User", email: "a@x.com" },
    { id: 2, name: "B User", email: "b@x.com" },
  ],
};
