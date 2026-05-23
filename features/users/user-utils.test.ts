import { describe, expect, it } from "vitest";
import { normalizeCreateUserInput, validateCreateUserInput } from "./user-utils";

describe("normalizeCreateUserInput", () => {
  it("trims and normalizes email casing", () => {
    const normalized = normalizeCreateUserInput({
      name: "  Jane Doe ",
      email: "  JANE@PCNS.ORG ",
      department: " Events ",
      role: "leader",
      temporaryPassword: "password123",
    });

    expect(normalized).toEqual({
      name: "Jane Doe",
      email: "jane@pcns.org",
      department: "Events",
      role: "leader",
      temporaryPassword: "password123",
    });
  });
});

describe("validateCreateUserInput", () => {
  it("accepts a valid PCNS user payload", () => {
    const errors = validateCreateUserInput({
      name: "Jane Doe",
      email: "jane@pcns.org",
      department: "Events",
      role: "member",
      temporaryPassword: "password123",
    });

    expect(errors).toEqual({});
  });

  it("rejects non-PCNS emails and short passwords", () => {
    const errors = validateCreateUserInput({
      name: "Jane Doe",
      email: "jane@example.com",
      department: "Events",
      role: "member",
      temporaryPassword: "pass",
    });

    expect(errors.email).toBe("Use a valid PCNS email address.");
    expect(errors.temporaryPassword).toBe("Temporary password must be at least 8 characters.");
  });
});
