"""LangGraph StateGraph assembly for the HR multi-agent pipeline.

Graph topology
--------------
::

    START
      │
      ▼
    router_node          ← Gemini classifies intent (no tool calls)
      │
      ├─[intent=vacation]──► vacation_node  ── END
      ├─[intent=policy]────► policy_node    ── END
      └─[intent=general_hr]► general_node   ── END

Usage
-----
::

    from backend.app.graph.graph import get_graph

    graph = get_graph()
    result = graph.invoke(initial_state)
    reply = result["reply"]
    trace = result["agent_trace"]
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from ._worker import make_worker_node
from .router_node import router_node
from .state import HRGraphState

# ---------------------------------------------------------------------------
# Worker nodes — each scoped to a distinct domain of HR tools.
# ---------------------------------------------------------------------------

vacation_node = make_worker_node(
    allowed_tools=frozenset({
        "check_vacation_eligibility",
        "book_time_off",
        "hr_get_employee_details",
        "hr_search_employees",
    }),
    node_label="VACATION",
)

policy_node = make_worker_node(
    allowed_tools=frozenset({
        "search_hr_policy",
        "mcp_list_directory",
        "mcp_read_file",
    }),
    node_label="POLICY",
)

general_node = make_worker_node(
    allowed_tools=frozenset({
        "hr_get_dashboard_summary",
        "hr_list_projects",
        "hr_search_employees",
        "hr_get_employee_details",
        "hr_list_employees_on_project",
        "hr_list_projects_for_employee",
        "hr_get_gender_counts_by_project",
    }),
    node_label="GENERAL_HR",
)


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

def _route_by_intent(state: HRGraphState) -> str:
    """Conditional-edge function: maps classified intent to the next node name."""
    intent = state.get("intent", "general_hr")
    if intent == "vacation":
        return "vacation_node"
    if intent == "policy":
        return "policy_node"
    return "general_node"


def build_graph() -> StateGraph:
    """Construct and compile the HR multi-agent StateGraph."""
    builder = StateGraph(HRGraphState)

    builder.add_node("router_node", router_node)
    builder.add_node("vacation_node", vacation_node)
    builder.add_node("policy_node", policy_node)
    builder.add_node("general_node", general_node)

    builder.add_edge(START, "router_node")
    builder.add_conditional_edges(
        "router_node",
        _route_by_intent,
        {
            "vacation_node": "vacation_node",
            "policy_node": "policy_node",
            "general_node": "general_node",
        },
    )
    builder.add_edge("vacation_node", END)
    builder.add_edge("policy_node", END)
    builder.add_edge("general_node", END)

    return builder.compile()


# Module-level singleton — avoids re-compilation on every request.
_compiled_graph = None


def get_graph() -> StateGraph:
    """Return the compiled graph, building it once on first call."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
