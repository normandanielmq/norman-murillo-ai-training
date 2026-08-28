"use client";

import { useState } from "react";
import { ErrorCallout } from "@/components/ErrorCallout";
import { ListPagePrimaryLink } from "@/components/ListPagePrimaryLink";
import { PageHeader } from "@/components/PageHeader";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import type { ProjectWithTeam } from "@/lib/project-types";
import { ProjectTable } from "@/features/projects/ProjectTable";
import { ProjectDeleteConfirmModal } from "@/features/projects/ProjectDeleteConfirmModal";

export default function ProjectsPage() {
  const { projects, loading, error: listError, loadProjects } = useProjects();
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithTeam | null>(null);
  const { deleteProject, deleting, error: deleteError, clearError: clearDeleteError } = useDeleteProject(() => {
    loadProjects();
    setDeleteTarget(null);
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
    clearDeleteError();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Project Management"
        eyebrow="Coordinator view • Granular control"
        actions={
          <ListPagePrimaryLink href="/projects/new">
            <span className="text-lg leading-none">+</span> Add Project
          </ListPagePrimaryLink>
        }
      />

      {listError ? (
        <ErrorCallout
          message={listError}
          onRetry={() => loadProjects()}
          retryClassName="mt-2 font-semibold"
          rounded="xl"
        />
      ) : null}

      <ProjectTable projects={projects} loading={loading} onDeleteClick={setDeleteTarget} />

      {deleteTarget && (
        <ProjectDeleteConfirmModal
          projectName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseDeleteModal}
          loading={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
