import { afterEach, describe, expect, it } from "vitest";
import { getEventFlowLoginPassword, isLoginPasswordValid, validateLoginInput } from "./auth-utils";

const ENV_KEY = "EVENTFLOW_LOGIN_PASSWORD";

describe("validateLoginInput", () => {
  it("validates a correct PCNS login shape", () => {
    const result = validateLoginInput({
      email: "member@pcns.org",
      password: "password123",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejects a non-PCNS email", () => {
    const result = validateLoginInput({
      email: "member@example.com",
      password: "password123",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe("Use a valid PCNS email address.");
  });
});

describe("environment login password", () => {
  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it("uses the configured environment password when present", () => {
    process.env[ENV_KEY] = "env-password";

    expect(getEventFlowLoginPassword()).toBe("env-password");
    expect(isLoginPasswordValid("env-password")).toBe(true);
    expect(isLoginPasswordValid("password123")).toBe(false);
  });

  it("falls back to the default local password when env is missing", () => {
    expect(getEventFlowLoginPassword()).toBe("password123");
    expect(isLoginPasswordValid("password123")).toBe(true);
    expect(isLoginPasswordValid("wrong-password")).toBe(false);
  });
});
