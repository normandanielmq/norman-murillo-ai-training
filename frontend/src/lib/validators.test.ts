import {
  validateEmail,
  validatePhone,
  validateDate,
  validateDateOfBirth,
  validateHireDate,
  validateDateOfBirthBeforeHire,
  validateEmployeeInput,
  validateProjectInput,
} from "./validators";

describe("validators", () => {
  describe("validateEmail", () => {
    it("returns error when email is empty", () => {
      expect(validateEmail("")).toBe("Email is required.");
      expect(validateEmail("   ")).toBe("Invalid email format.");
    });

    it("returns error for invalid email format", () => {
      expect(validateEmail("notanemail")).toBe("Invalid email format.");
      expect(validateEmail("missing@domain")).toBe("Invalid email format.");
      expect(validateEmail("@nodomain.com")).toBe("Invalid email format.");
    });

    it("returns null for valid email", () => {
      expect(validateEmail("a@b.co")).toBeNull();
      expect(validateEmail("user@example.com")).toBeNull();
      expect(validateEmail("  user@example.com  ")).toBeNull();
    });
  });

  describe("validatePhone", () => {
    it("returns error when phone is empty", () => {
      expect(validatePhone("")).toBe("Phone is required.");
    });

    it("returns error when phone has no country code", () => {
      expect(validatePhone("555-1234")).toBe(
        "Phone must include a country code (e.g. +1, +44)."
      );
      expect(validatePhone("1234567890")).toBe(
        "Phone must include a country code (e.g. +1, +44)."
      );
    });

    it("returns null when phone has country code", () => {
      expect(validatePhone("+1 555-1234")).toBeNull();
      expect(validatePhone("+44 20 7946 0958")).toBeNull();
      expect(validatePhone("+81")).toBeNull();
    });
  });

  describe("validateDate", () => {
    it("returns error when value is empty", () => {
      expect(validateDate("", "Hire date")).toBe("Hire date is required.");
    });

    it("returns error for invalid date format", () => {
      expect(validateDate("not-a-date", "Hire date")).toBe(
        "Hire date must be a valid date (YYYY-MM-DD)."
      );
      expect(validateDate("01/15/2024", "Hire date")).toBe(
        "Hire date must be a valid date (YYYY-MM-DD)."
      );
    });

    it("returns null for valid ISO date", () => {
      expect(validateDate("2024-01-15", "Hire date")).toBeNull();
      expect(validateDate("2020-06-01", "Date of birth")).toBeNull();
    });
  });

  describe("validateDateOfBirth", () => {
    it("returns error when date is in the future", () => {
      expect(validateDateOfBirth("2099-01-01")).toBe("Date of birth cannot be in the future.");
    });

    it("returns error when date is more than 120 years ago", () => {
      expect(validateDateOfBirth("1900-01-01")).toBe("Date of birth must be within the last 120 years.");
    });

    it("returns null for valid past date", () => {
      expect(validateDateOfBirth("1990-01-15")).toBeNull();
    });
  });

  describe("validateHireDate", () => {
    it("returns error when hire date is in the future", () => {
      expect(validateHireDate("2099-12-31")).toBe("Hire date cannot be in the future.");
    });

    it("returns null for valid past or today date", () => {
      expect(validateHireDate("2020-01-01")).toBeNull();
    });
  });

  describe("validateDateOfBirthBeforeHire", () => {
    it("returns error when date of birth is after hire date", () => {
      expect(validateDateOfBirthBeforeHire("2024-01-01", "2020-01-01")).toBe(
        "Date of birth must be before hire date."
      );
    });

    it("returns error when date of birth equals hire date", () => {
      expect(validateDateOfBirthBeforeHire("2020-06-15", "2020-06-15")).toBe(
        "Date of birth must be before hire date."
      );
    });

    it("returns null when date of birth is before hire date", () => {
      expect(validateDateOfBirthBeforeHire("1990-01-15", "2020-01-01")).toBeNull();
    });
  });

  describe("validateEmployeeInput", () => {
    const validCreateInput = {
      name: "Jane Doe",
      email: "jane@example.com",
      nationalId: "123-45-6789",
      phone: "+1 555-000-0000",
      country: "United States",
      gender: "Female",
      dateOfBirth: "1990-01-15",
      officialTitle: "Engineer",
      hireDate: "2020-01-01",
    };

    it("returns valid for complete create input", () => {
      const result = validateEmployeeInput(validCreateInput, false);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns errors for missing required fields on create", () => {
      const result = validateEmployeeInput({}, false);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain("Name is required.");
      expect(result.errors).toContain("Email is required.");
      expect(result.errors).toContain("National ID is required.");
      expect(result.errors).toContain("Phone is required.");
      expect(result.errors).toContain("Country is required.");
      expect(result.errors).toContain("Gender is required.");
      expect(result.errors).toContain("Job title is required.");
    });

    it("returns error for invalid email on create", () => {
      const result = validateEmployeeInput(
        { ...validCreateInput, email: "invalid" },
        false
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("email") || e === "Invalid email format.")).toBe(true);
    });

    it("returns error for phone without country code on create", () => {
      const result = validateEmployeeInput(
        { ...validCreateInput, phone: "555-1234" },
        false
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("country code"))).toBe(true);
    });

    it("allows partial input on update (only validate provided fields)", () => {
      const result = validateEmployeeInput(
        { name: "Updated Name" },
        true
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns errors for invalid provided fields on update", () => {
      const result = validateEmployeeInput(
        { email: "bad-email" },
        true
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns error when date of birth is after hire date", () => {
      const result = validateEmployeeInput(
        {
          ...validCreateInput,
          dateOfBirth: "2025-01-01",
          hireDate: "2020-01-01",
        },
        false
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Date of birth must be before hire date.");
    });

    it("returns error when hire date is in the future", () => {
      const result = validateEmployeeInput(
        { ...validCreateInput, hireDate: "2099-01-01" },
        false
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Hire date cannot be in the future"))).toBe(true);
    });
  });

  describe("validateProjectInput", () => {
    it("returns valid for create with name and empty description string", () => {
      const result = validateProjectInput({ name: "HR Portal", description: "" }, false);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns error when project name is missing or blank on create", () => {
      expect(validateProjectInput({ name: "", description: "" }, false).errors).toContain(
        "Project name is required."
      );
      expect(validateProjectInput({ name: "   ", description: "x" }, false).errors).toContain(
        "Project name is required."
      );
    });

    it("returns error when name exceeds 256 characters", () => {
      const result = validateProjectInput({ name: "x".repeat(257), description: "" }, false);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("256"))).toBe(true);
    });

    it("returns error when description is undefined on create", () => {
      const result = validateProjectInput({ name: "OK" }, false);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Description is required.");
    });

    it("returns error when description is too long", () => {
      const result = validateProjectInput(
        { name: "OK", description: "d".repeat(5001) },
        false
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("5000"))).toBe(true);
    });

    it("allows partial fields on update", () => {
      expect(validateProjectInput({ name: "New title" }, true).valid).toBe(true);
      expect(validateProjectInput({ description: "Only desc" }, true).valid).toBe(true);
    });

    it("validates provided name on update when invalid", () => {
      const result = validateProjectInput({ name: "" }, true);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Project name is required.");
    });
  });
});
