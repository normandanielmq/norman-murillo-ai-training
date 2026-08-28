import { NextResponse } from "next/server";
import * as projectService from "@/lib/project.service";
import { parseId, badRequest, notFound, withBackendRoute } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string; employeeId: string }>;
}

export const DELETE = withBackendRoute(async function DELETE(_request: Request, { params }: RouteParams) {
  const { id, employeeId: empParam } = await params;
  const projectId = parseId(id);
  const employeeId = parseId(empParam);
  if (projectId === null) return badRequest("Invalid project ID.", []);
  if (employeeId === null) return badRequest("Invalid employee ID.", []);

  const removed = await projectService.unassignEmployeeFromProject(projectId, employeeId);
  if (!removed) return notFound("Assignment not found.");
  return new NextResponse(null, { status: 204 });
});
