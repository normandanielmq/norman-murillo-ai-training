"""Internal REST surface used by the Next.js app (repository parity)."""

from __future__ import annotations

import sqlite3
from typing import Annotated, Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import JSONResponse

from ..database import connect
from ..repositories import dashboard_repo, employee_repo, project_repo

router = APIRouter(prefix="/internal/repo", tags=["internal-repo"])


def get_db() -> sqlite3.Connection:
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


Db = Annotated[sqlite3.Connection, Depends(get_db)]


# --- Employees ---


@router.get("/employees")
def repo_employees_list(db: Db) -> list[dict[str, Any]]:
    return employee_repo.list_all(db)


@router.get("/employees/paged")
def repo_employees_paged(
    db: Db,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, alias="pageSize"),
    country: Optional[str] = None,
    gender: Optional[str] = None,
    project_id: Optional[int] = Query(None, alias="projectId"),
    sort_by: str = Query("name", alias="sortBy"),
    sort_order: Literal["asc", "desc"] = Query("asc", alias="sortOrder"),
) -> dict[str, Any]:
    return employee_repo.list_paged(
        db,
        page=page,
        page_size=page_size,
        country=country or None,
        gender=gender or None,
        project_id=project_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/employees/by-id/{employee_id}")
def repo_employee_get(db: Db, employee_id: int) -> Response:
    row = employee_repo.get_by_id(db, employee_id)
    if row is None:
        return Response(status_code=404)
    return JSONResponse(row)


@router.post("/employees")
def repo_employee_create(db: Db, body: dict[str, Any]) -> JSONResponse:
    result = employee_repo.create(db, body)
    if "error" in result:
        return JSONResponse(result, status_code=200)
    return JSONResponse(result, status_code=200)


@router.patch("/employees/{employee_id}")
def repo_employee_update(db: Db, employee_id: int, body: dict[str, Any]) -> JSONResponse:
    result = employee_repo.update(db, employee_id, body)
    if result is None:
        raise HTTPException(status_code=404, detail="Not found")
    if "error" in result:
        return JSONResponse(result, status_code=200)
    return JSONResponse(result, status_code=200)


@router.delete("/employees/{employee_id}")
def repo_employee_delete(db: Db, employee_id: int) -> Response:
    ok = employee_repo.delete_by_id(db, employee_id)
    if not ok:
        return Response(status_code=404)
    return Response(status_code=204)


# --- Projects ---


@router.get("/projects")
def repo_projects_list(db: Db) -> list[dict[str, Any]]:
    return project_repo.list_projects(db)


@router.get("/projects/with-team-preview")
def repo_projects_team(db: Db) -> list[dict[str, Any]]:
    return project_repo.list_projects_with_team_preview(db)


@router.get("/projects/by-id/{project_id}")
def repo_project_get(db: Db, project_id: int) -> Response:
    row = project_repo.get_project_by_id(db, project_id)
    if row is None:
        return Response(status_code=404)
    return JSONResponse(row)


@router.post("/projects")
def repo_project_create(db: Db, body: dict[str, Any]) -> dict[str, Any]:
    return project_repo.create_project(db, body)


@router.patch("/projects/{project_id}")
def repo_project_update(db: Db, project_id: int, body: dict[str, Any]) -> JSONResponse:
    row = project_repo.update_project(db, project_id, body)
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")
    return JSONResponse(row, status_code=200)


@router.delete("/projects/{project_id}")
def repo_project_delete(db: Db, project_id: int) -> Response:
    ok = project_repo.delete_project_by_id(db, project_id)
    if not ok:
        return Response(status_code=404)
    return Response(status_code=204)


@router.get("/projects/{project_id}/employees-full")
def repo_project_employees(db: Db, project_id: int) -> list[dict[str, Any]]:
    return project_repo.list_employees_for_project(db, project_id)


@router.get("/projects/{project_id}/employee-ids")
def repo_project_employee_ids(db: Db, project_id: int) -> list[int]:
    return project_repo.list_employee_ids_for_project(db, project_id)


@router.get("/employees/{employee_id}/projects-full")
def repo_employee_projects(db: Db, employee_id: int) -> list[dict[str, Any]]:
    return project_repo.list_projects_for_employee(db, employee_id)


@router.get("/employees/{employee_id}/project-ids")
def repo_employee_project_ids(db: Db, employee_id: int) -> list[int]:
    return project_repo.list_project_ids_for_employee(db, employee_id)


@router.get("/assignments/exists")
def repo_assignment_exists(
    db: Db,
    employeeId: int = Query(alias="employeeId"),
    projectId: int = Query(alias="projectId"),
) -> dict[str, bool]:
    return {"exists": project_repo.assignment_exists(db, employeeId, projectId)}


@router.post("/assignments")
def repo_assignment_create(db: Db, body: dict[str, Any]) -> JSONResponse:
    employee_id = int(body["employeeId"])
    project_id = int(body["projectId"])
    start = body.get("startDate")
    result = project_repo.assign_employee_to_project(db, employee_id, project_id, start)
    return JSONResponse(result, status_code=200)


@router.delete("/assignments/{employee_id}/{project_id}")
def repo_assignment_delete(db: Db, employee_id: int, project_id: int) -> Response:
    ok = project_repo.unassign_employee_from_project(db, employee_id, project_id)
    if not ok:
        return Response(status_code=404)
    return Response(status_code=204)


# --- Dashboard ---


@router.get("/dashboard/count-all-employees")
def repo_dash_count_all(db: Db) -> dict[str, int]:
    return {"count": dashboard_repo.count_all_employees(db)}


@router.get("/dashboard/aggregate-by-country")
def repo_dash_country(db: Db) -> list[dict[str, Any]]:
    return dashboard_repo.aggregate_employees_by_country(db)


@router.get("/dashboard/count-on-at-least-one-project")
def repo_dash_on_project(db: Db) -> dict[str, int]:
    return {"count": dashboard_repo.count_employees_on_at_least_one_project(db)}


@router.get("/dashboard/headcount-by-project")
def repo_dash_headcount(db: Db) -> list[dict[str, Any]]:
    return dashboard_repo.aggregate_headcount_by_project(db)


@router.get("/dashboard/gender-by-project-raw")
def repo_dash_gender(db: Db) -> list[dict[str, Any]]:
    return dashboard_repo.aggregate_gender_counts_by_project_raw(db)
