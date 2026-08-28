"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { EmployeeForm } from "@/features/employees/EmployeeForm";
import { useEmployee, useUpdateEmployee } from "@/hooks/useEmployees";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { employee, loading, error } = useEmployee(id);
  const { updateEmployee } = useUpdateEmployee(id);

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/employees" className="mt-2 inline-block text-sm text-violet-600 hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-gray-500">Loading…</p>;
  }

  if (employee === null) {
    return (
      <div>
        <p className="text-gray-600">Employee not found.</p>
        <Link href="/employees" className="mt-2 inline-block text-sm text-violet-600 hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Edit Employee</h2>
      <p className="mt-1 text-gray-600">Update the details below.</p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <EmployeeForm
          initialData={employee}
          submitLabel="Update Employee"
          onSubmit={updateEmployee}
          onSuccess={() => router.push("/employees")}
        />
      </div>
    </div>
  );
}
