#!/usr/bin/env node
/** Runs uvicorn using backend/.venv so system Python does not need global uvicorn. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backend = path.join(__dirname, "..", "backend");
const venvPython =
  process.platform === "win32"
    ? path.join(backend, ".venv", "Scripts", "python.exe")
    : path.join(backend, ".venv", "bin", "python");

if (!fs.existsSync(venvPython)) {
  console.error(`Missing ${path.join("backend", ".venv")}.
Run once from the repo root:

  npm run setup:backend

Then retry:

  npm run dev:backend
  npm run dev:all
`);
  process.exit(1);
}

const child = spawn(
  venvPython,
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
  { cwd: backend, stdio: "inherit" }
);
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
