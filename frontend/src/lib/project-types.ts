export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

/** Returned by GET /api/projects for the management grid (team preview). */
export type ProjectWithTeam = Project & {
  memberCount: number;
  teamPreview: { id: number; name: string; email: string }[];
};

export interface CreateProjectDto {
  name: string;
  description: string;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;
