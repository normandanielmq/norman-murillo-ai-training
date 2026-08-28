#!/usr/bin/env node
/**
 * Creates backend/.venv if needed and installs backend/requirements.txt (uvicorn, fastapi).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backend = path.join(__dirname, "..", "backend");
const venvDir = path.join(backend, ".venv");

const systemPython = process.platform === "win32" ? "python" : "python3";

function venvPip() {
  return process.platform === "win32"
    ? path.join(venvDir, "Scripts", "pip.exe")
    : path.join(venvDir, "bin", "pip");
}

if (!fs.existsSync(venvDir)) {
  console.log("Creating Python virtualenv in backend/.venv …");
  const venv = spawnSync(systemPython, ["-m", "venv", ".venv"], {
    cwd: backend,
    stdio: "inherit",
  });
  if (venv.status !== 0) {
    console.error(
      "\nCould not create venv. Ensure Python 3 is installed (`python3 --version`).\n"
    );
    process.exit(venv.status ?? 1);
  }
}

const pip = venvPip();
if (!fs.existsSync(pip)) {
  console.error("pip not found in .venv after creation. Try deleting backend/.venv and run again.");
  process.exit(1);
}

console.log("Installing backend Python dependencies …");
const install = spawnSync(pip, ["install", "-r", "requirements.txt"], {
  cwd: backend,
  stdio: "inherit",
});
process.exit(install.status ?? 1);
