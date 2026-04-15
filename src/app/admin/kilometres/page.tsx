import { prisma } from "@/lib/prisma";
import { addKilometres } from "@/lib/actions";
import KilometresFormClient from "@/components/KilometresFormClient";

export const dynamic = "force-dynamic";

export default async function KilometresPage() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      kilometres: { orderBy: { date: "desc" }, take: 30 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Gestion des Kilometres
      </h1>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Ajouter des Kilometres
        </h2>
        <KilometresFormClient
          users={users.map((u) => ({ id: u.id, name: u.name }))}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {users.map((user) => {
          const totalKm = user.kilometres.reduce((s, k) => s + k.value, 0);
          return (
            <div
              key={user.id}
              className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    Total: {totalKm.toFixed(1)} km
                  </span>
                </div>
              </div>
              <div className="max-h-48 divide-y divide-gray-50 overflow-y-auto">
                {user.kilometres.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-400">
                    Aucun kilometre enregistre
                  </p>
                ) : (
                  user.kilometres.map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between px-6 py-2 text-sm"
                    >
                      <span className="text-gray-600">
                        {k.date.toLocaleDateString("fr-FR")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {k.value} km
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
