import { NextResponse } from "next/server";
import * as chatService from "@/lib/chat.service";
import type { ChatTurn } from "@/lib/chat.repository";
import { parseJsonBody, withBackendRoute } from "@/lib/api-response";

export const POST = withBackendRoute(async function POST(request: Request) {
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.body as { message?: unknown; messages?: unknown };

  let messages: ChatTurn[];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages as ChatTurn[];
  } else {
    const message = typeof body.message === "string" ? body.message : "";
    messages = [{ role: "user", content: message }];
  }

  const result = await chatService.askAssistant(messages);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: result.status }
    );
  }

  return NextResponse.json({
    reply: result.reply,
    ...(result.agentTrace !== undefined ? { agentTrace: result.agentTrace } : {}),
    ...(result.intent !== undefined ? { intent: result.intent } : {}),
  });
});
