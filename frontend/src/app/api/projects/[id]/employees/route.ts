import { NextResponse } from "next/server";
import * as projectService from "@/lib/project.service";
import { parseId, parseJsonBody, badRequest, notFound, withBackendRoute } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withBackendRoute(async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseId(id);
  if (projectId === null) return badRequest("Invalid project ID.", []);

  if (!(await projectService.getProjectById(projectId))) return notFound("Project not found.");

  const employees = await projectService.listEmployeesForProject(projectId);
  return NextResponse.json({ employees });
});

export const POST = withBackendRoute(async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const projectId = parseId(id);
  if (projectId === null) return badRequest("Invalid project ID.", []);

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.body as { employeeId?: unknown; startDate?: unknown };
  const employeeId =
    typeof body.employeeId === "number"
      ? body.employeeId
      : typeof body.employeeId === "string"
        ? parseInt(body.employeeId, 10)
        : NaN;

  if (!Number.isInteger(employeeId) || employeeId < 1) {
    return badRequest("Invalid employee ID.", ["employeeId must be a positive integer."]);
  }

  const startDate =
    typeof body.startDate === "string" && body.startDate.trim() !== "" ? body.startDate.trim() : null;

  const result = await projectService.assignEmployeeToProject(projectId, employeeId, { startDate });
  if (!result.success) {
    if (result.error === "Employee not found." || result.error === "Project not found.") {
      return notFound(result.error);
    }
    return badRequest(result.error, result.details);
  }
  return NextResponse.json({ ok: true }, { status: 201 });
});
