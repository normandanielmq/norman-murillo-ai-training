"use client";

import type { Employee } from "@/lib/employee-types";
import { AssignmentLinkModal } from "@/features/assignments/AssignmentLinkModal";

export interface EmployeeProjectAssignModalProps {
  employee: Employee;
  onClose: () => void;
  onSaved?: () => void;
}

export function EmployeeProjectAssignModal(props: Readonly<EmployeeProjectAssignModalProps>) {
  return <AssignmentLinkModal variant="employeeProjects" {...props} />;
}
