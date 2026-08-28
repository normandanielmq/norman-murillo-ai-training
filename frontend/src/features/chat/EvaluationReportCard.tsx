import type { AgentIntent, AgentTraceStep } from "@/lib/chat.repository";

interface EvaluationReportCardProps {
  intent: AgentIntent;
  agentTrace: AgentTraceStep[];
}

const INTENT_META: Record<
  Exclude<AgentIntent, "">,
  { label: string; color: string; bg: string; dot: string }
> = {
  vacation: {
    label: "Vacation Agent",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  policy: {
    label: "Policy Agent",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  general_hr: {
    label: "General HR Agent",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    dot: "bg-violet-500",
  },
};

function IntentBadge({ intent }: Readonly<{ intent: Exclude<AgentIntent, ""> }>) {
  const meta = INTENT_META[intent];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

function TraceStep({
  step,
  index,
  total,
}: Readonly<{ step: AgentTraceStep; index: number; total: number }>) {
  const isLast = index === total - 1;
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
          {index + 1}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200" aria-hidden />}
      </div>
      <div className={`pb-3 ${isLast ? "" : ""}`}>
        <p className="text-xs font-medium text-gray-800">{step.label}</p>
        <p className="mt-0.5 font-mono text-[10px] text-gray-400">{step.tool}</p>
      </div>
    </li>
  );
}

export function EvaluationReportCard({
  intent,
  agentTrace,
}: Readonly<EvaluationReportCardProps>) {
  if (!intent && agentTrace.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-semibold text-gray-600">Agent Execution Report</p>
        {intent ? <IntentBadge intent={intent} /> : null}
      </div>

      {agentTrace.length > 0 ? (
        <>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Tools executed
          </p>
          <ol className="list-none space-y-0">
            {agentTrace.map((step, i) => (
              <TraceStep key={`${step.tool}-${i}`} step={step} index={i} total={agentTrace.length} />
            ))}
          </ol>
        </>
      ) : (
        <p className="text-gray-400">No tools were called for this response.</p>
      )}
    </div>
  );
}
