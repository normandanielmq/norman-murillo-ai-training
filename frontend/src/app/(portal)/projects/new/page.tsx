"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectCreateForm } from "@/features/projects/ProjectCreateForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Create New Project" }]} />
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Project</h1>
      <p className="mt-2 text-sm text-gray-500">Fill in the details below to initialize a new initiative.</p>
      <div className="mt-8">
        <ProjectCreateForm />
      </div>
    </div>
  );
}
