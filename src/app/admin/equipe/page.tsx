import { prisma } from "@/lib/prisma";
import { assignDailyRole, autoRotateRoles } from "@/lib/actions";
import RoleAssignmentClient from "@/components/RoleAssignmentClient";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      assignments: {
        where: { date: today },
      },
    },
    orderBy: { name: "asc" },
  });

  const membersWithRoles = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    todayRole: u.assignments[0]?.roleType || null,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion Equipe</h1>
        <form action={autoRotateRoles}>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Rotation auto demain
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Membres ({membersWithRoles.length}) &mdash; Roles du{" "}
            {today.toLocaleDateString("fr-FR")}
          </h2>
        </div>

        {membersWithRoles.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">
            Aucun membre dans l&apos;equipe
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {membersWithRoles.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {member.todayRole ? (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        member.todayRole === "CONFIRMATION"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {member.todayRole}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Non assigne</span>
                  )}
                  <RoleAssignmentClient userId={member.id} todayStr={today.toISOString().split("T")[0]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
