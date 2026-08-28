"use client";

import type { Project } from "@/lib/project-types";
import { AssignmentLinkModal } from "@/features/assignments/AssignmentLinkModal";

export interface ProjectEmployeeAssignModalProps {
  project: Project;
  onClose: () => void;
  onSaved?: () => void;
}

export function ProjectEmployeeAssignModal(props: Readonly<ProjectEmployeeAssignModalProps>) {
  return <AssignmentLinkModal variant="projectEmployees" {...props} />;
}
