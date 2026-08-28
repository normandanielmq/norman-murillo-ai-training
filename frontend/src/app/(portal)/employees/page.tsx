"use client";

import { useState } from "react";
import { ErrorCallout } from "@/components/ErrorCallout";
import { ListPagePrimaryLink } from "@/components/ListPagePrimaryLink";
import { PageHeader } from "@/components/PageHeader";
import { useDeleteEmployee } from "@/hooks/useEmployees";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import type { Employee } from "@/lib/employee-types";
import { DeleteConfirmModal } from "@/features/employees/DeleteConfirmModal";
import { EmployeeDirectoryFilterBar } from "@/features/employees/EmployeeDirectoryFilterBar";
import { EmployeeDirectoryPagination } from "@/features/employees/EmployeeDirectoryPagination";
import { EmployeeTable } from "@/features/employees/EmployeeTable";
import { EmployeeProjectAssignModal } from "@/features/employees/EmployeeProjectAssignModal";

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error: listError,
    loadEmployees,
    country,
    setCountry,
    gender,
    setGender,
    projectId,
    setProjectId,
    countryOptions,
    genderOptions,
    projects,
    optionsLoading,
    filtersActive,
    clearFilters,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
  } = useEmployeeDirectory();
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [assignTarget, setAssignTarget] = useState<Employee | null>(null);
  const { deleteEmployee, deleting, error: deleteError, clearError: clearDeleteError } = useDeleteEmployee(() => {
    loadEmployees();
    setDeleteTarget(null);
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteEmployee(deleteTarget.id);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
    clearDeleteError();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage and view all personnel records"
        titleAs="h2"
        size="md"
        layout="row"
        actions={
          <ListPagePrimaryLink href="/employees/new">
            <span className="text-lg leading-none">+</span> Add Employee
          </ListPagePrimaryLink>
        }
      />

      {listError ? (
        <ErrorCallout message={listError} onRetry={() => loadEmployees()} />
      ) : null}

      <EmployeeDirectoryFilterBar
        country={country}
        gender={gender}
        projectId={projectId}
        countryOptions={countryOptions}
        genderOptions={genderOptions}
        projects={projects}
        optionsLoading={optionsLoading}
        filtersActive={filtersActive}
        onCountryChange={setCountry}
        onGenderChange={setGender}
        onProjectIdChange={setProjectId}
        onClear={clearFilters}
      />

      <EmployeeTable
        employees={employees}
        loading={loading}
        onDeleteClick={setDeleteTarget}
        onAssignProjectsClick={setAssignTarget}
        emptyMessage={
          filtersActive
            ? "No employees match these filters."
            : "No employees yet."
        }
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={toggleSort}
      />

      <EmployeeDirectoryPagination
        page={page}
        pageSize={pageSize}
        total={total}
        disabled={loading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {assignTarget && (
        <EmployeeProjectAssignModal
          employee={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSaved={() => loadEmployees()}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          employeeName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseDeleteModal}
          loading={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
