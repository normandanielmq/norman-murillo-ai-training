"""LLM-as-a-Judge: automated evaluation of the Vacation Agent.

This script replays a set of mock vacation-booking conversations through the
LangGraph pipeline and then asks a separate "Judge" Gemini call to score each
response against a strict rubric.

Usage
-----
From the ``backend/`` directory (with the venv activated):

    python scripts/evaluate_vacation_agent.py

Environment variables
---------------------
GEMINI_API_KEY   — required
GEMINI_MODEL     — optional, defaults to gemini-2.5-flash (executor model)
GEMINI_JUDGE_MODEL — optional, defaults to gemini-2.5-flash (judge model)

Output
------
Prints a JSON evaluation report for each test case to stdout and writes a
``scripts/evaluation_report.json`` summary file.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Make backend/ importable when run from the repo root or from backend/.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(_BACKEND_DIR / ".env")

from app.prompts import JUDGE_CRITERIA, JUDGE_SYSTEM_PROMPT


# ---------------------------------------------------------------------------
# Mock test cases
# ---------------------------------------------------------------------------

TEST_CASES = [
    {
        "id": "TC-01",
        "description": "Employee requests valid weekday vacation",
        "conversation": [
            {"role": "user", "content": "I'd like to book time off for employee 1 from 2026-06-02 to 2026-06-04."},
        ],
        "rubric": {
            "must_check_eligibility": True,
            "must_confirm_booking_or_reject": True,
            "must_explain_rejection_if_denied": False,
            "must_not_book_on_weekend": True,
            "must_respect_50pct_capacity_rule": True,
        },
    },
    {
        "id": "TC-02",
        "description": "Employee requests vacation that includes a weekend day",
        "conversation": [
            {"role": "user", "content": "Book time off for employee 2 from 2026-06-05 to 2026-06-07."},
        ],
        "rubric": {
            "must_check_eligibility": True,
            "must_confirm_booking_or_reject": True,
            "must_explain_rejection_if_denied": True,
            "must_not_book_on_weekend": True,
            "must_respect_50pct_capacity_rule": True,
        },
    },
    {
        "id": "TC-03",
        "description": "Eligibility check without booking",
        "conversation": [
            {"role": "user", "content": "Can employee 3 take time off from 2026-07-14 to 2026-07-15?"},
        ],
        "rubric": {
            "must_check_eligibility": True,
            "must_confirm_booking_or_reject": False,
            "must_explain_rejection_if_denied": True,
            "must_not_book_on_weekend": True,
            "must_respect_50pct_capacity_rule": True,
        },
    },
    {
        "id": "TC-04",
        "description": "Multi-turn: user provides missing date after prompt",
        "conversation": [
            {"role": "user", "content": "I want to request time off for employee 1."},
            {"role": "assistant", "content": "I'd be happy to help. What dates are you requesting?"},
            {"role": "user", "content": "From 2026-08-10 to 2026-08-12."},
        ],
        "rubric": {
            "must_check_eligibility": True,
            "must_confirm_booking_or_reject": True,
            "must_explain_rejection_if_denied": True,
            "must_not_book_on_weekend": True,
            "must_respect_50pct_capacity_rule": True,
        },
    },
]


# ---------------------------------------------------------------------------
# Judge rubric prompt  (loaded from app/prompts/)
# ---------------------------------------------------------------------------


def _build_judge_prompt(test_case: dict, agent_reply: str) -> str:
    conv_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in test_case["conversation"]
    )
    criteria_text = "\n".join(
        f"- {k}: {JUDGE_CRITERIA.get(k, k)}"
        for k in test_case["rubric"]
        if test_case["rubric"][k]
    )
    return (
        f"## Conversation\n{conv_text}\n\n"
        f"## Assistant's Final Reply\n{agent_reply}\n\n"
        f"## Rubric Criteria to Evaluate\n{criteria_text}"
    )


# ---------------------------------------------------------------------------
# Run agent and judge
# ---------------------------------------------------------------------------

def run_agent(test_case: dict, api_key: str) -> tuple[str, list[dict]]:
    """Invoke the LangGraph HR pipeline for a test conversation."""
    import sqlite3
    from app.graph.graph import get_graph
    from app.database import DEFAULT_DB_PATH
    from app.chat_service import _extract_entities_from_db, _inject_entity_context

    conversation = [dict(m) for m in test_case["conversation"]]

    conn = sqlite3.connect(str(DEFAULT_DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        last_user_msg = next(
            (m["content"] for m in reversed(conversation) if m["role"] == "user"), ""
        )
        entities = _extract_entities_from_db(conn, last_user_msg)
        conversation = _inject_entity_context(conversation, entities)
    finally:
        conn.close()

    initial_state = {
        "messages": conversation,
        "intent": "",
        "entities": entities,
        "api_key": api_key,
        "db_path": str(DEFAULT_DB_PATH),
        "reply": "",
        "agent_trace": [],
    }

    graph = get_graph()
    result = graph.invoke(initial_state)
    return result.get("reply", ""), result.get("agent_trace", [])


def run_judge(test_case: dict, agent_reply: str, api_key: str) -> dict:
    """Ask the Judge LLM to evaluate the agent's reply against the rubric."""
    import google.generativeai as genai

    judge_model_name = os.environ.get(
        "GEMINI_JUDGE_MODEL", os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    )
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=judge_model_name,
        system_instruction=JUDGE_SYSTEM_PROMPT,
    )

    prompt = _build_judge_prompt(test_case, agent_reply)
    response = model.generate_content(prompt)
    raw = (getattr(response, "text", "") or "").strip()

    # Strip markdown code fences if the model wrapped the JSON.
    if raw.startswith("```"):
        raw = "\n".join(
            line for line in raw.splitlines()
            if not line.strip().startswith("```")
        ).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        return {
            "error": f"Judge returned invalid JSON: {exc}",
            "raw_response": raw,
            "overall_pass": False,
            "overall_score": 0,
        }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("ERROR: GEMINI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    results = []

    for tc in TEST_CASES:
        print(f"\n{'=' * 60}")
        print(f"Test case {tc['id']}: {tc['description']}")
        print("─" * 60)

        # Step 1: Run the agent.
        print("Running HR agent…")
        try:
            reply, trace = run_agent(tc, api_key)
        except Exception as exc:
            print(f"  AGENT ERROR: {exc}")
            results.append({"id": tc["id"], "error": str(exc)})
            continue

        print(f"  Agent reply ({len(reply)} chars): {reply[:200]}{'…' if len(reply) > 200 else ''}")
        if trace:
            print(f"  Tools used: {[t['tool'] for t in trace]}")

        # Step 2: Judge the reply.
        print("Running judge LLM…")
        try:
            judgment = run_judge(tc, reply, api_key)
        except Exception as exc:
            print(f"  JUDGE ERROR: {exc}")
            judgment = {"error": str(exc), "overall_pass": False, "overall_score": 0}

        overall = "PASS ✓" if judgment.get("overall_pass") else "FAIL ✗"
        score = judgment.get("overall_score", "N/A")
        print(f"  Judgment: {overall}  score={score}/100")
        if "summary" in judgment:
            print(f"  Summary: {judgment['summary']}")

        results.append({
            "id": tc["id"],
            "description": tc["description"],
            "agent_reply": reply,
            "agent_trace": trace,
            "judgment": judgment,
        })

    # Write full report.
    report_path = Path(__file__).parent / "evaluation_report.json"
    report_path.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\n{'=' * 60}")
    print(f"Evaluation complete. Full report written to: {report_path}")

    passed = sum(1 for r in results if r.get("judgment", {}).get("overall_pass"))
    print(f"Results: {passed}/{len(results)} test cases PASSED")


if __name__ == "__main__":
    main()
