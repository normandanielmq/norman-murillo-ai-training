"""Prompt loader — reads all system-instruction text files from this package directory.

Each prompt is loaded once at import time and exposed as a module-level constant.
Keeping prompts in plain text files makes them easy to edit, diff, and version
without touching Python source code.

Exports
-------
HR_ASSISTANT_PROMPT   — System instruction for the HR executor worker nodes.
ROUTER_PROMPT         — System instruction for the LangGraph Router Node.
JUDGE_SYSTEM_PROMPT   — System instruction for the LLM-as-a-Judge evaluator.
JUDGE_CRITERIA        — Dict mapping rubric criterion keys to their descriptions.
"""

from __future__ import annotations

import json
from pathlib import Path

_DIR = Path(__file__).resolve().parent


def _load(filename: str) -> str:
    return (_DIR / filename).read_text(encoding="utf-8").strip()


HR_ASSISTANT_PROMPT: str = _load("hr_assistant.txt")
ROUTER_PROMPT: str = _load("router.txt")
JUDGE_SYSTEM_PROMPT: str = _load("judge_system.txt")
JUDGE_CRITERIA: dict[str, str] = json.loads((_DIR / "judge_criteria.json").read_text(encoding="utf-8"))
