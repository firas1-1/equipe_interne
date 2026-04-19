import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Bar({
  label,
  done,
  total,
  barColor,
}: {
  label: string;
  done: number;
  total: number;
  barColor: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {done}/{total} &middot; {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function PerformancePage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    total,
    doneCount,
    byType,
    members,
    memberStats,
    recent,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "DONE" } }),
    prisma.order.groupBy({
      by: ["type", "status"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.order.groupBy({
      by: ["assignedUserId", "status"],
      where: { assignedUserId: { not: null } },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    }),
  ]);

  const pendingCount = total - doneCount;
  const completionRate = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const typeStats = {
    CONFIRMATION: { done: 0, total: 0 },
    RECLAMATION: { done: 0, total: 0 },
  };
  for (const row of byType) {
    const bucket = typeStats[row.type];
    bucket.total += row._count._all;
    if (row.status === "DONE") bucket.done += row._count._all;
  }

  const perMember = members.map((m) => {
    const rows = memberStats.filter((r) => r.assignedUserId === m.id);
    const done = rows.filter((r) => r.status === "DONE").reduce((s, r) => s + r._count._all, 0);
    const totalAssigned = rows.reduce((s, r) => s + r._count._all, 0);
    const rate = totalAssigned === 0 ? 0 : Math.round((done / totalAssigned) * 100);
    return { ...m, done, total: totalAssigned, pending: totalAssigned - done, rate };
  });
  perMember.sort((a, b) => b.rate - a.rate || b.done - a.done);

  const days: { label: string; created: number; done: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const created = recent.filter((o) => o.createdAt >= d && o.createdAt < next).length;
    const done = recent.filter(
      (o) => o.createdAt >= d && o.createdAt < next && o.status === "DONE"
    ).length;
    days.push({
      label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
      created,
      done,
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.created));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Performance de l&apos;Equipe</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ordres totaux" value={total} color="text-gray-900" />
        <StatCard label="Ordres termines" value={doneCount} color="text-green-600" />
        <StatCard label="Ordres en cours" value={pendingCount} color="text-yellow-600" />
        <StatCard
          label="Taux de completion"
          value={`${completionRate}%`}
          sub={`${doneCount} / ${total}`}
          color="text-blue-600"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Par type</h2>
          <div className="space-y-4">
            <Bar
              label="CONFIRMATION"
              done={typeStats.CONFIRMATION.done}
              total={typeStats.CONFIRMATION.total}
              barColor="bg-green-500"
            />
            <Bar
              label="RECLAMATION"
              done={typeStats.RECLAMATION.done}
              total={typeStats.RECLAMATION.total}
              barColor="bg-orange-500"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Activite (7 derniers jours)
          </h2>
          <div className="flex h-40 items-end gap-2">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-full w-full flex-col justify-end">
                  <div
                    className="w-full rounded-t bg-blue-500 transition-all"
                    style={{ height: `${(d.created / maxDay) * 100}%` }}
                    title={`${d.created} cree, ${d.done} termine`}
                  />
                  {d.created > 0 && (
                    <span className="absolute -top-5 left-0 right-0 text-center text-xs font-medium text-gray-600">
                      {d.created}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Performance par membre</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Base sur les ordres assignes directement a chaque membre
          </p>
        </div>
        {perMember.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">Aucun membre</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Membre</th>
                  <th className="px-4 py-3 font-medium">Assignes</th>
                  <th className="px-4 py-3 font-medium">Termines</th>
                  <th className="px-4 py-3 font-medium">En cours</th>
                  <th className="px-4 py-3 font-medium">Taux</th>
                  <th className="px-4 py-3 font-medium">Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perMember.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-700">{m.total}</td>
                    <td className="px-4 py-3 text-green-600">{m.done}</td>
                    <td className="px-4 py-3 text-yellow-600">{m.pending}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{m.rate}%</td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${m.rate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
