"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/features/auth/auth-actions";
import { validateLoginInput } from "@/features/auth/auth-utils";
import type { LoginCredentials, LoginFieldErrors } from "@/features/auth/auth-types";

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof LoginCredentials, value: string) {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateLoginInput(credentials);

    if (!validation.valid) {
      setErrors(validation.errors);
      setFormError("Check the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const result = await signInAction(credentials);

    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors ?? {});
      setFormError(result.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
      {formError ? (
        <div
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}
      <Input
        autoComplete="email"
        error={errors.email}
        label="Email"
        name="email"
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="name@pcns.org"
        type="email"
        value={credentials.email}
      />
      <Input
        autoComplete="current-password"
        error={errors.password}
        label="Password"
        name="password"
        onChange={(event) => updateField("password", event.target.value)}
        placeholder="Minimum 8 characters"
        type="password"
        value={credentials.password}
      />
      <Button className="mt-2 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
