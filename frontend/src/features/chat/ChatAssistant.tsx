"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorCallout } from "@/components/ErrorCallout";
import { INPUT_CLASS } from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { useChat } from "@/hooks/useChat";
import { EvaluationReportCard } from "./EvaluationReportCard";

export function ChatAssistant() {
  const formId = useId();
  const inputId = `${formId}-question`;
  const { messages, sending, loadingPhase, error, details, sendMessage, clearConversation } =
    useChat();
  const [draft, setDraft] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = draft.trim();
      if (!text || sending) return;
      setDraft("");
      await sendMessage(text);
    },
    [draft, sending, sendMessage]
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="HR assistant"
        description="Ask HR questions, look up teams, or book time off. The LangGraph router triages each request to the correct specialist agent (Vacation, Policy, or General HR)."
        eyebrow="Session 8 · Multi-Agent Orchestration"
      />

      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-sm text-gray-500">Conversation</p>
          <Button type="button" variant="neutral" size="sm" onClick={clearConversation}>
            Clear
          </Button>
        </div>

        <div
          ref={scrollAreaRef}
          className="flex min-h-[280px] max-h-[min(480px,60vh)] flex-col gap-3 overflow-y-auto px-4 py-4"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              Try: &ldquo;Book time off for employee 1 next Monday&rdquo; or &ldquo;What is the remote work policy?&rdquo;
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={`msg-${i}-${m.role}`}
                className={`max-w-[95%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div
                  className={`rounded-xl px-4 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-violet-100 text-violet-950"
                      : "border border-gray-100 bg-gray-50 text-gray-900"
                  }`}
                >
                  <span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
                {m.role === "assistant" && (m.agentTrace?.length || m.intent) ? (
                  <EvaluationReportCard
                    intent={m.intent ?? ""}
                    agentTrace={m.agentTrace ?? []}
                  />
                ) : null}
              </div>
            ))
          )}
          {sending ? (
            <div
              className="mr-auto flex max-w-[95%] items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm text-violet-900"
              role="status"
              aria-live="polite"
            >
              <span
                className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-violet-400 border-t-transparent"
                aria-hidden
              />
              <span>{loadingPhase}</span>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="border-t border-gray-100 px-4 pb-2 pt-3">
            <div role="alert">
              <ErrorCallout message={error} rounded="xl" />
              {details.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="border-t border-gray-100 p-4">
          <label htmlFor={inputId} className="sr-only">
            Your question
          </label>
          <textarea
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            disabled={sending}
            placeholder="Ask about HR data, policies, or book time off (weekdays only; capacity rules apply)&hellip;"
            className={INPUT_CLASS}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button type="submit" variant="primary" disabled={sending || !draft.trim()}>
              {sending ? "Sending\u2026" : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
