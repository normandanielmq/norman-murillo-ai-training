"use client";

import { useCallback, useEffect, useState } from "react";
import { parseApiErrorPayload } from "@/lib/api-error-payload";
import { parseJsonSafe } from "@/lib/parse-json-response";
import { parseAgentIntent, parseAgentTrace, type AgentIntent, type AgentTraceStep } from "@/lib/chat.repository";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  agentTrace?: AgentTraceStep[];
  intent?: AgentIntent;
};

export type SendMessageResult =
  | { ok: true }
  | { ok: false; error: string; details?: string[] };

/** Rotating status lines while the agent runs tools on the backend (Session 6 UX). */
const LOADING_PHASES = [
  "Connecting to assistant…",
  "Checking vacation rules…",
  "Verifying project capacity…",
  "Running HR tools…",
];

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (!sending) {
      return;
    }
    const id = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % LOADING_PHASES.length);
    }, 1700);
    return () => window.clearInterval(id);
  }, [sending]);

  const loadingPhase = LOADING_PHASES[phaseIdx] ?? LOADING_PHASES[0];

  const sendMessage = useCallback(async (rawText: string): Promise<SendMessageResult> => {
    const text = rawText.trim();
    if (!text) {
      return { ok: false, error: "Enter a question first." };
    }

    const thread: ChatMessage[] = [...messages, { role: "user", content: text }];

    setSending(true);
    setPhaseIdx(0);
    setError(null);
    setDetails([]);
    setMessages(thread);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        const reply = (data as { reply?: string }).reply ?? "";
        const agentTrace = parseAgentTrace((data as { agentTrace?: unknown }).agentTrace);
        const intent = parseAgentIntent((data as { intent?: unknown }).intent);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, agentTrace, intent },
        ]);
        return { ok: true };
      }
      const parsed = parseApiErrorPayload(data, "Could not get a response.");
      setError(parsed.error);
      setDetails(parsed.details);
      return { ok: false, error: parsed.error, details: parsed.details };
    } catch {
      const msg = "Request failed. Check your connection and try again.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setSending(false);
      setPhaseIdx(0);
    }
  }, [messages]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setDetails([]);
  }, []);

  return { messages, sending, loadingPhase, error, details, sendMessage, clearConversation };
}
