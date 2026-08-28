import { NextResponse } from "next/server";
import * as dashboardService from "@/lib/dashboard.service";
import { withBackendRoute } from "@/lib/api-response";

export const GET = withBackendRoute(async function GET() {
  const result = await dashboardService.getInsights();
  if (!result.success) {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: 500 }
    );
  }
  return NextResponse.json(result.data);
});
