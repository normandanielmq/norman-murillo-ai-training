import { NextResponse } from "next/server";
import * as projectService from "@/lib/project.service";
import * as employeeService from "@/lib/employee.service";
import { parseId, badRequest, notFound, withBackendRoute } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withBackendRoute(async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const employeeId = parseId(id);
  if (employeeId === null) return badRequest("Invalid employee ID.", []);

  if (!(await employeeService.getById(employeeId))) return notFound("Employee not found.");

  const projects = await projectService.listProjectsForEmployee(employeeId);
  return NextResponse.json({ projects });
});
