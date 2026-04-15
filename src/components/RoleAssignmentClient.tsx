"use client";

import { assignDailyRole } from "@/lib/actions";
import { useTransition } from "react";

export default function RoleAssignmentClient({
  userId,
  todayStr,
}: {
  userId: string;
  todayStr: string;
}) {
  const [isPending, startTransition] = useTransition();

  function assign(roleType: string) {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("roleType", roleType);
    formData.set("date", todayStr);
    startTransition(() => assignDailyRole(formData));
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => assign("CONFIRMATION")}
        disabled={isPending}
        className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
      >
        Confirmation
      </button>
      <button
        onClick={() => assign("RECLAMATION")}
        disabled={isPending}
        className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
      >
        Reclamation
      </button>
    </div>
  );
}
