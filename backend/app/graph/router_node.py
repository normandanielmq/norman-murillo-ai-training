"""Router Node — classifies user intent and routes to the correct worker node.

Intent values
-------------
- ``"vacation"``  — booking / checking time off, leave management
- ``"policy"``    — HR policy questions, rules, guidelines, documents
- ``"general_hr"``— employee lookups, project queries, dashboards, everything else
"""

from __future__ import annotations

import os
import re

import google.generativeai as genai

from ..prompts import ROUTER_PROMPT
from .state import HRGraphState

_ROUTER_SYSTEM_INSTRUCTION = ROUTER_PROMPT

_VALID_INTENTS = frozenset({"vacation", "policy", "general_hr"})


def router_node(state: HRGraphState) -> dict:
    """Classify the latest user message and set ``intent`` in the graph state."""
    api_key = state["api_key"]
    messages = state["messages"]
    model_name = os.environ.get("GEMINI_ROUTER_MODEL", os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"))

    last_user_msg = next(
        (m.get("content", "") for m in reversed(messages) if m.get("role") == "user"),
        "",
    )

    print(f"\n[ROUTER] Classifying intent for: {last_user_msg[:120]!r}")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=_ROUTER_SYSTEM_INSTRUCTION,
    )

    try:
        response = model.generate_content(last_user_msg)
        raw = (getattr(response, "text", "") or "").strip().lower()
        # Strip any trailing punctuation the model may have added.
        intent = re.sub(r"[^a-z_]", "", raw)
    except Exception as exc:
        print(f"[ROUTER] Gemini call failed ({exc}); defaulting to general_hr")
        intent = "general_hr"

    if intent not in _VALID_INTENTS:
        print(f"[ROUTER] Unrecognised intent {intent!r}; defaulting to general_hr")
        intent = "general_hr"

    print(f"[ROUTER] → intent={intent}")
    return {"intent": intent}
