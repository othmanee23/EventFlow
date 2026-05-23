"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteUserModal } from "@/components/users/invite-user-modal";

type UsersManagementHeaderProps = {
  canInviteUsers: boolean;
};

export function UsersManagementHeader({ canInviteUsers }: UsersManagementHeaderProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border-soft bg-white p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">User management</h2>
        <p className="mt-1 text-sm text-slate-500">Review internal access and role responsibilities for the Events workspace.</p>
      </div>
      {canInviteUsers ? (
        <>
          <Button onClick={() => setInviteModalOpen(true)}>Invite user</Button>
          <InviteUserModal onClose={() => setInviteModalOpen(false)} open={inviteModalOpen} />
        </>
      ) : null}
    </section>
  );
}
