import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/user";

type RoleBadgeProps = {
  role: UserRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant = role === "admin" ? "blue" : role === "leader" ? "green" : "gray";

  return <Badge variant={variant}>{ROLES[role]}</Badge>;
}

