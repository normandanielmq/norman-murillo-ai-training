"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PORTAL_ELEVATED_PANEL_CLASS } from "@/lib/portal-layout-classes";
import type { ProjectWithTeam } from "@/lib/project-types";
import { getInitialsFromName } from "@/lib/format-name";
import { Button } from "@/components/Button";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";

const TH = "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400";
const PAGE_SIZE = 5;
const STATUS_DOTS = ["bg-blue-500", "bg-amber-500", "bg-slate-400", "bg-violet-500"] as const;

function displayProjectId(createdAt: string, id: number): string {
  let y = new Date().getFullYear();
  try {
    y = new Date(createdAt).getFullYear();
  } catch {
    /* keep default */
  }
  return `PRJ-${y}-${String(id).padStart(2, "0")}`;
}

export interface ProjectTableProps {
  projects: ProjectWithTeam[];
  loading: boolean;
  onDeleteClick: (project: ProjectWithTeam) => void;
}

export function ProjectTable({ projects, loading, onDeleteClick }: ProjectTableProps) {
  const [sortKey, setSortKey] = useState<"name" | "team">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = (a.memberCount ?? 0) - (b.memberCount ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [projects, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE) || 1);
  const pageSafe = Math.min(page, totalPages - 1);
  const pageSlice = sorted.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE);

  const goToPreviousPage = () => setPage(Math.max(0, pageSafe - 1));
  const goToNextPage = () => setPage(Math.min(totalPages - 1, pageSafe + 1));

  const toggleSort = (key: "name" | "team") => {
    setPage(0);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className={`overflow-hidden ${PORTAL_ELEVATED_PANEL_CLASS}`}>
      {loading ? (
        <div className="p-16 text-center text-sm text-gray-500">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center text-sm text-gray-500">No projects yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-white">
                  <th scope="col" className={TH}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 p-0 font-semibold text-gray-400 hover:bg-transparent hover:text-gray-600"
                    >
                      Project name
                      <span className="text-[10px] opacity-70" aria-hidden>
                        {sortKey === "name" ? (sortDir === "asc" ? "▼" : "▲") : "⇅"}
                      </span>
                    </Button>
                  </th>
                  <th scope="col" className={TH}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleSort("team")}
                      className="inline-flex items-center gap-1 p-0 font-semibold text-gray-400 hover:bg-transparent hover:text-gray-600"
                    >
                      Team
                      <span className="text-[10px] opacity-70" aria-hidden>
                        {sortKey === "team" ? (sortDir === "asc" ? "▼" : "▲") : "⇅"}
                      </span>
                    </Button>
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pageSlice.map((proj, index) => {
                  const preview = proj.teamPreview ?? [];
                  const globalIndex = projects.findIndex((p) => p.id === proj.id);
                  const dotClass = STATUS_DOTS[globalIndex >= 0 ? globalIndex % STATUS_DOTS.length : index % STATUS_DOTS.length];
                  return (
                    <tr key={proj.id} className="transition-colors hover:bg-violet-50/30">
                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
                            aria-hidden
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{proj.name}</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              ID: {displayProjectId(proj.createdAt, proj.id)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {(proj.memberCount ?? 0) === 0 ? (
                          <span className="text-sm text-gray-400">—</span>
                        ) : preview.length > 0 && (proj.memberCount ?? 0) > 3 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center pl-1">
                              {preview.slice(0, 3).map((m, i) => (
                                <div
                                  key={m.id}
                                  className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-700 first:ml-0"
                                  style={{ zIndex: 3 - i }}
                                  title={m.name}
                                >
                                  {getInitialsFromName(m.name)}
                                </div>
                              ))}
                            </div>
                            <span className="ml-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-600">
                              +{(proj.memberCount ?? 0) - Math.min(3, preview.length)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {proj.memberCount ?? 0} member{(proj.memberCount ?? 0) === 1 ? "" : "s"}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/projects/${proj.id}/edit`}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="Edit"
                            aria-label={`Edit ${proj.name}`}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onDeleteClick(proj)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                            aria-label={`Delete ${proj.name}`}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Page {pageSafe + 1} of {totalPages} ({sorted.length} total projects)
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="neutral"
                size="md"
                disabled={pageSafe <= 0}
                onClick={goToPreviousPage}
                className="px-4 py-2 text-gray-600 disabled:opacity-40"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="md"
                disabled={pageSafe >= totalPages - 1}
                onClick={goToNextPage}
                className="px-4 py-2 text-gray-900 disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
