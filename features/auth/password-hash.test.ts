import { describe, expect, it } from "vitest";
import { hashPasswordForStorage, verifyStoredPassword } from "./password-hash";

describe("password hashing", () => {
  it("verifies the same password against its stored hash", () => {
    const hash = hashPasswordForStorage("password123");
    expect(verifyStoredPassword("password123", hash)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const hash = hashPasswordForStorage("password123");
    expect(verifyStoredPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", () => {
    expect(verifyStoredPassword("password123", "invalid")).toBe(false);
    expect(verifyStoredPassword("password123", "scrypt$only-salt")).toBe(false);
  });
});
