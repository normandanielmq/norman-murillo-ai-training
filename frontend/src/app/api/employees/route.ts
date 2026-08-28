import { NextResponse } from "next/server";
import * as employeeService from "@/lib/employee.service";
import { parseJsonBody, badRequest, withBackendRoute } from "@/lib/api-response";

export const GET = withBackendRoute(async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await employeeService.listEmployeesFromQuery(searchParams);
  if (!result.success) {
    return badRequest(result.error, result.details);
  }
  return NextResponse.json(result.result);
});

export const POST = withBackendRoute(async function POST(request: Request) {
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = await employeeService.create(parsed.body as Parameters<typeof employeeService.create>[0]);
  if (!result.success) return badRequest(result.error, result.details);

  return NextResponse.json(result.employee, { status: 201 });
});
