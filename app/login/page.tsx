import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-navy px-6 py-12">
      <Card className="w-full max-w-md border-white/10 bg-white">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-sky text-brand-blue">
            <LockKeyhole aria-hidden="true" className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-brand-blue">Policy Center for the New South</p>
          <CardTitle>{APP_NAME}</CardTitle>
          <p className="text-sm text-slate-500">Sign in to coordinate event preparation work.</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
