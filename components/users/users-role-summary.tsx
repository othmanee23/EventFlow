import { ShieldCheck, UserRoundCog, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ROLES } from "@/lib/constants";
import type { User, UserRole } from "@/types/user";

type UsersRoleSummaryProps = {
  users: User[];
};

const roleIcons: Record<UserRole, typeof ShieldCheck> = {
  admin: ShieldCheck,
  leader: UserRoundCog,
  member: UsersRound,
};

export function UsersRoleSummary({ users }: UsersRoleSummaryProps) {
  const roles: UserRole[] = ["admin", "leader", "member"];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {roles.map((role) => {
        const Icon = roleIcons[role];
        const count = users.filter((user) => user.role === role).length;

        return (
          <Card key={role}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{ROLES[role]}</p>
                <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{count}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-sky text-brand-blue">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

