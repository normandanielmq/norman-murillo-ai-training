import { NextResponse } from "next/server";
import * as projectService from "@/lib/project.service";
import { parseJsonBody, badRequest, withBackendRoute } from "@/lib/api-response";

export const GET = withBackendRoute(async function GET() {
  const projects = await projectService.listProjectsWithTeam();
  return NextResponse.json(projects);
});

export const POST = withBackendRoute(async function POST(request: Request) {
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = await projectService.create(parsed.body as Parameters<typeof projectService.create>[0]);
  if (!result.success) return badRequest(result.error, result.details);

  return NextResponse.json(result.project, { status: 201 });
});
