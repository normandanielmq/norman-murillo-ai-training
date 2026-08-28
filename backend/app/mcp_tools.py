"""MCP Filesystem Server integration using the official mcp Python SDK.

Spawns @modelcontextprotocol/server-filesystem as an npx subprocess and communicates
via the MCP protocol. Access is restricted to the session-7-mock-docs/ directory only.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
from pathlib import Path
from typing import Any

from google.generativeai.types import FunctionDeclaration

logger = logging.getLogger(__name__)

DOCS_DIR = str(Path(__file__).resolve().parent.parent / "session-7-mock-docs")

_MCP_SERVER_PACKAGE = "@modelcontextprotocol/server-filesystem"


async def _call_mcp_tool_async(tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Connect to the MCP filesystem server, call one tool, and return the result."""
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    server_params = StdioServerParameters(
        command="npx",
        args=["-y", _MCP_SERVER_PACKAGE, DOCS_DIR],
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, args)

    content_list = result.content or []
    text_parts = [item.text for item in content_list if hasattr(item, "text")]
    return {"content": "\n".join(text_parts), "isError": result.isError}


def call_mcp_filesystem(tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Synchronous wrapper: run the async MCP call in a fresh event loop.

    Safe to call from FastAPI sync route handlers (which run in a thread pool
    with no existing event loop).
    """
    npx_path = shutil.which("npx")
    if npx_path is None:
        return {"error": "npx not found. Install Node.js to enable MCP filesystem access."}

    try:
        return asyncio.run(_call_mcp_tool_async(tool_name, args))
    except Exception as exc:
        logger.error("MCP call failed: %s", exc)
        return {"error": f"MCP server error: {exc}"}


def mcp_function_declarations() -> list[FunctionDeclaration]:
    """Gemini FunctionDeclarations for MCP filesystem tools."""
    return [
        FunctionDeclaration(
            name="mcp_list_directory",
            description=(
                "List the HR policy document files available in the documents directory "
                "using the MCP Filesystem Server. Use this to discover which policy files "
                "exist before deciding which one to read directly."
            ),
            parameters={
                "type": "object",
                "properties": {},
            },
        ),
        FunctionDeclaration(
            name="mcp_read_file",
            description=(
                "Read the full text content of a specific HR policy document file "
                "using the MCP Filesystem Server. Use the file path returned by "
                "mcp_list_directory. Prefer search_hr_policy for policy questions; "
                "use this tool when you need the complete text of one specific document."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": (
                            "Full absolute path to the policy document file to read, "
                            "as returned by mcp_list_directory."
                        ),
                    },
                },
                "required": ["path"],
            },
        ),
    ]
