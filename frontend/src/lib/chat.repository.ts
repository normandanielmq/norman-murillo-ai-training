import { backendFetch } from "./backend-fetch";
import { parseApiErrorPayload } from "./api-error-payload";
import { parseJsonSafe } from "./parse-json-response";

export type AgentTraceStep = {
  tool: string;
  label: string;
};

/** Routing intent set by the LangGraph Router Node. */
export type AgentIntent = "vacation" | "policy" | "general_hr" | "";

/** One turn in the HR assistant thread (matches Gemini user/model mapping on the server). */
export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatAskResult =
  | { ok: true; reply: string; agentTrace?: AgentTraceStep[]; intent?: AgentIntent }
  | { ok: false; error: string; details: string[]; status: number };

export function parseAgentTrace(raw: unknown): AgentTraceStep[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return (raw as AgentTraceStep[]).filter(
    (t): t is AgentTraceStep =>
      t !== null &&
      typeof t === "object" &&
      typeof (t as AgentTraceStep).tool === "string" &&
      typeof (t as AgentTraceStep).label === "string"
  );
}

export function parseAgentIntent(raw: unknown): AgentIntent {
  return raw === "vacation" || raw === "policy" || raw === "general_hr" ? raw : "";
}

export async function ask(messages: ChatTurn[]): Promise<ChatAskResult> {
  const res = await backendFetch("/internal/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await parseJsonSafe(res);
  if (res.ok) {
    const reply = (data as { reply?: string }).reply;
    if (typeof reply === "string") {
      const agentTrace = parseAgentTrace((data as { agentTrace?: unknown }).agentTrace);
      const intent = parseAgentIntent((data as { intent?: unknown }).intent);
      return { ok: true, reply, agentTrace, intent };
    }
    return {
      ok: false,
      error: "Invalid response from assistant.",
      details: [],
      status: 502,
    };
  }
  const parsed = parseApiErrorPayload(data, "Chat request failed.");
  const status = res.status >= 400 ? res.status : 502;
  return { ok: false, error: parsed.error, details: parsed.details, status };
}
