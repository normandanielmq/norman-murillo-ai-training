const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
/** Phone must start with + followed by at least one digit (country code). */
const PHONE_COUNTRY_CODE_REGEX = /^\+\d/;

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== "string") return "Email is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Invalid email format.";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || typeof phone !== "string") return "Phone is required.";
  if (!PHONE_COUNTRY_CODE_REGEX.test(phone.trim())) return "Phone must include a country code (e.g. +1, +44).";
  return null;
}

export function validateDate(value: string, fieldName: string): string | null {
  if (!value || typeof value !== "string") return `${fieldName} is required.`;
  const trimmed = value.trim();
  if (!ISO_DATE_REGEX.test(trimmed)) return `${fieldName} must be a valid date (YYYY-MM-DD).`;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return `${fieldName} must be a valid date.`;
  return null;
}

const TODAY = (): string => new Date().toISOString().slice(0, 10);

/** Date of birth: required, valid date, not in the future, and not more than 120 years ago. */
export function validateDateOfBirth(value: string): string | null {
  const base = validateDate(value, "Date of birth");
  if (base) return base;
  const trimmed = value.trim();
  if (trimmed > TODAY()) return "Date of birth cannot be in the future.";
  const birth = new Date(trimmed);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 120);
  if (birth < cutoff) return "Date of birth must be within the last 120 years.";
  return null;
}

/** Hire date: required, valid date, not in the future. */
export function validateHireDate(value: string): string | null {
  const base = validateDate(value, "Hire date");
  if (base) return base;
  const trimmed = value.trim();
  if (trimmed > TODAY()) return "Hire date cannot be in the future.";
  return null;
}

/** Date of birth must be before hire date. Call only when both are already valid dates. */
export function validateDateOfBirthBeforeHire(dateOfBirth: string, hireDate: string): string | null {
  if (!dateOfBirth.trim() || !hireDate.trim()) return null;
  const dob = new Date(dateOfBirth.trim());
  const hire = new Date(hireDate.trim());
  if (dob >= hire) return "Date of birth must be before hire date.";
  return null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EmployeeInput {
  name?: string;
  email?: string;
  nationalId?: string;
  phone?: string;
  country?: string;
  gender?: string;
  dateOfBirth?: string;
  officialTitle?: string;
  hireDate?: string;
}

export function validateEmployeeInput(input: EmployeeInput, isUpdate = false): ValidationResult {
  const errors: string[] = [];

  if (!isUpdate || input.name !== undefined) {
    if (!input.name || typeof input.name !== "string" || !input.name.trim()) errors.push("Name is required.");
  }
  if (!isUpdate || input.email !== undefined) {
    const e = validateEmail(input.email ?? "");
    if (e) errors.push(e);
  }
  if (!isUpdate || input.nationalId !== undefined) {
    if (!input.nationalId || typeof input.nationalId !== "string" || !input.nationalId.trim()) errors.push("National ID is required.");
  }
  if (!isUpdate || input.phone !== undefined) {
    const p = validatePhone(input.phone ?? "");
    if (p) errors.push(p);
  }
  if (!isUpdate || input.country !== undefined) {
    if (!input.country || typeof input.country !== "string" || !input.country.trim()) errors.push("Country is required.");
  }
  if (!isUpdate || input.gender !== undefined) {
    if (!input.gender || typeof input.gender !== "string" || !input.gender.trim()) errors.push("Gender is required.");
  }
  if (!isUpdate || input.dateOfBirth !== undefined) {
    const d = validateDateOfBirth(input.dateOfBirth ?? "");
    if (d) errors.push(d);
  }
  if (!isUpdate || input.officialTitle !== undefined) {
    if (!input.officialTitle || typeof input.officialTitle !== "string" || !input.officialTitle.trim()) errors.push("Job title is required.");
  }
  if (!isUpdate || input.hireDate !== undefined) {
    const h = validateHireDate(input.hireDate ?? "");
    if (h) errors.push(h);
  }

  const dob = input.dateOfBirth?.trim() ?? "";
  const hire = input.hireDate?.trim() ?? "";
  if (dob && hire) {
    const orderErr = validateDateOfBirthBeforeHire(dob, hire);
    if (orderErr) errors.push(orderErr);
  }

  return { valid: errors.length === 0, errors };
}

const MAX_PROJECT_DESCRIPTION_LENGTH = 5000;

export interface ProjectInput {
  name?: string;
  description?: string;
}

export function validateProjectInput(input: ProjectInput, isUpdate = false): ValidationResult {
  const errors: string[] = [];

  if (!isUpdate || input.name !== undefined) {
    if (!input.name || typeof input.name !== "string" || !input.name.trim()) {
      errors.push("Project name is required.");
    } else if (input.name.length > 256) {
      errors.push("Project name must be at most 256 characters.");
    }
  }
  if (!isUpdate || input.description !== undefined) {
    if (input.description === undefined || input.description === null) {
      errors.push("Description is required.");
    } else if (typeof input.description !== "string") {
      errors.push("Description must be a string.");
    } else if (input.description.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
      errors.push(`Description must be at most ${MAX_PROJECT_DESCRIPTION_LENGTH} characters.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
