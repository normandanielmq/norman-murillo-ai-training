import { NextResponse } from "next/server";
import * as projectService from "@/lib/project.service";
import { parseId, parseJsonBody, badRequest, notFound, withBackendRoute } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function resolveProjectId(params: Promise<{ id: string }>): Promise<number | NextResponse> {
  const { id } = await params;
  const numId = parseId(id);
  if (numId === null) return badRequest("Invalid project ID.", []);
  return numId;
}

export const GET = withBackendRoute(async function GET(_request: Request, { params }: RouteParams) {
  const idOrError = await resolveProjectId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const project = await projectService.getProjectById(idOrError);
  if (!project) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(project);
});

export const PUT = withBackendRoute(async function PUT(request: Request, { params }: RouteParams) {
  const idOrError = await resolveProjectId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = await projectService.update(idOrError, parsed.body as Parameters<typeof projectService.update>[1]);
  if (result === null) return notFound("Project not found.");
  if (!result.success) return badRequest(result.error, result.details);
  return NextResponse.json(result.project);
});

export const DELETE = withBackendRoute(async function DELETE(_request: Request, { params }: RouteParams) {
  const idOrError = await resolveProjectId(params);
  if (idOrError instanceof NextResponse) return idOrError;

  const deleted = await projectService.deleteById(idOrError);
  if (!deleted) return notFound("Project not found.");
  return new NextResponse(null, { status: 204 });
});
