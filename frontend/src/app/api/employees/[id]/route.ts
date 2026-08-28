import { NextResponse } from "next/server";
import * as employeeService from "@/lib/employee.service";
import { parseId, parseJsonBody, badRequest, notFound, withBackendRoute } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function resolveId(params: Promise<{ id: string }>): Promise<number | NextResponse> {
  const { id } = await params;
  const numId = parseId(id);
  if (numId === null) return badRequest("Invalid employee ID.", []);
  return numId;
}

export const GET = withBackendRoute(async function GET(_request: Request, { params }: RouteParams) {
  const idOrError = await resolveId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const employee = await employeeService.getById(idOrError);
  if (!employee) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(employee);
});

export const PUT = withBackendRoute(async function PUT(request: Request, { params }: RouteParams) {
  const idOrError = await resolveId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = await employeeService.update(idOrError, parsed.body as Parameters<typeof employeeService.update>[1]);
  if (result === null) return notFound("Employee not found.");
  if (!result.success) return badRequest(result.error, result.details);
  return NextResponse.json(result.employee);
});

export const DELETE = withBackendRoute(async function DELETE(_request: Request, { params }: RouteParams) {
  const idOrError = await resolveId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const deleted = await employeeService.deleteById(idOrError);
  if (!deleted) return notFound("Employee not found.");
  return new NextResponse(null, { status: 204 });
});
