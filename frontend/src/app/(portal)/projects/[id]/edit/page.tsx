"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FormCard } from "@/components/FormCard";
import { useProject, useUpdateProject } from "@/hooks/useProjects";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { project, loading, error } = useProject(id);
  const { updateProject } = useUpdateProject(id);

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-red-600">{error}</p>
        <Link href="/projects" className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (loading || project === undefined) {
    return <p className="py-12 text-center text-gray-500">Loading…</p>;
  }

  if (project === null) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-gray-600">Project not found.</p>
        <Link href="/projects" className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Project</h1>
          <p className="mt-2 text-sm text-gray-500">Update name, description, or manage team assignments.</p>
        </div>
        <Link
          href={`/projects/${id}/assign`}
          className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-100"
        >
          Assign employee
        </Link>
      </div>
      <div className="mt-8">
        <FormCard>
          <ProjectForm
            initialData={project}
            submitLabel="Update Project"
            onSubmit={updateProject}
            onSuccess={() => router.push("/projects")}
          />
        </FormCard>
      </div>
    </div>
  );
}
