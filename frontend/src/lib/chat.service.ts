import type { AgentIntent, AgentTraceStep, ChatTurn } from "./chat.repository";
import * as chatRepository from "./chat.repository";

const MAX_MESSAGE_LENGTH = 8000;
const MAX_THREAD_MESSAGES = 50;

export type AskAssistantResult =
  | { success: true; reply: string; agentTrace?: AgentTraceStep[]; intent?: AgentIntent }
  | { success: false; error: string; details: string[]; status: number };

function isValidTurn(m: unknown): m is ChatTurn {
  if (m === null || typeof m !== "object") return false;
  const o = m as { role?: unknown; content?: unknown };
  const role = o.role;
  const content = o.content;
  if (role !== "user" && role !== "assistant") return false;
  return typeof content === "string";
}

export async function askAssistant(messages: ChatTurn[]): Promise<AskAssistantResult> {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      success: false,
      error: "Conversation is empty.",
      details: [],
      status: 400,
    };
  }

  const trimmed = messages.slice(-MAX_THREAD_MESSAGES);
  if (!trimmed.every(isValidTurn)) {
    return {
      success: false,
      error: "Invalid message format.",
      details: [],
      status: 400,
    };
  }

  const last = trimmed[trimmed.length - 1];
  if (last.role !== "user") {
    return {
      success: false,
      error: "Last message must be from the user.",
      details: [],
      status: 400,
    };
  }

  const lastContent = last.content.trim();
  if (!lastContent) {
    return {
      success: false,
      error: "Message cannot be empty.",
      details: [],
      status: 400,
    };
  }
  if (lastContent.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: "Message is too long.",
      details: [`Maximum length is ${MAX_MESSAGE_LENGTH} characters.`],
      status: 400,
    };
  }

  const result = await chatRepository.ask(trimmed);
  if (result.ok) {
    return { success: true, reply: result.reply, agentTrace: result.agentTrace, intent: result.intent };
  }
  return {
    success: false,
    error: result.error,
    details: result.details,
    status: result.status,
  };
}
