"""SQLite connection and schema (single source of truth for on-disk DB)."""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = ROOT / "data" / "hr.sqlite"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS employees (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  national_id    TEXT NOT NULL,
  phone          TEXT NOT NULL,
  country        TEXT NOT NULL,
  gender         TEXT NOT NULL,
  date_of_birth  TEXT NOT NULL,
  official_title TEXT NOT NULL,
  hire_date      TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  UNIQUE(national_id, country)
);

CREATE TABLE IF NOT EXISTS projects (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_projects (
  employee_id    INTEGER NOT NULL,
  project_id     INTEGER NOT NULL,
  start_date     TEXT,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vacation_requests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id    INTEGER NOT NULL,
  start_date     TEXT NOT NULL,
  end_date       TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
"""


def get_db_path() -> str:
    raw = os.environ.get("HR_SQLITE_PATH")
    if raw:
        return raw
    return str(DEFAULT_DB_PATH)


def connect() -> sqlite3.Connection:
    path = get_db_path()
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(CREATE_TABLE_SQL)
    return conn


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(CREATE_TABLE_SQL)
