"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/features/employees/EmployeeForm";
import { useCreateEmployee } from "@/hooks/useEmployees";

export default function NewEmployeePage() {
  const router = useRouter();
  const { createEmployee } = useCreateEmployee();

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
      <p className="mt-1 text-gray-600">
        Session 1: Workshop Foundation - Enter the details of the new hire below.
      </p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <EmployeeForm
          submitLabel="Save Employee"
          onSubmit={createEmployee}
          onSuccess={() => router.push("/employees")}
        />
      </div>
    </div>
  );
}
