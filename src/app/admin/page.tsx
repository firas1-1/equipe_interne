import { prisma } from "@/lib/prisma";
import { deleteOrder } from "@/lib/actions";
import OrderFormClient from "@/components/OrderFormClient";
import Link from "next/link";

async function deleteOrderAction(formData: FormData): Promise<void> {
  "use server";
  await deleteOrder(formData);
}

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ view?: string; page?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const view: "cards" | "table" = sp.view === "table" ? "table" : "cards";
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [total, members] = await Promise.all([
    prisma.order.count(),
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      admin: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  const buildHref = (params: { view?: string; page?: number }) => {
    const q = new URLSearchParams();
    q.set("view", params.view ?? view);
    q.set("page", String(params.page ?? page));
    return `/admin?${q.toString()}`;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Gestion des Ordres</h1>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Nouvel Ordre</h2>
        <OrderFormClient members={members} />
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tous les Ordres ({total})
          </h2>
          <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-gray-200">
            <Link
              href={buildHref({ view: "cards", page: 1 })}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                view === "cards"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cartes
            </Link>
            <Link
              href={buildHref({ view: "table", page: 1 })}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                view === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Tableau
            </Link>
          </div>
        </div>

        {orders.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-400">Aucun ordre pour le moment</p>
        )}

        {orders.length > 0 && view === "cards" && (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-gray-900">{order.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.type === "CONFIRMATION"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {order.type}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "DONE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status === "DONE" ? "Termine" : "En cours"}
                    </span>
                    {order.assignedTo && (
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        → {order.assignedTo.name}
                      </span>
                    )}
                  </div>
                  {order.description && (
                    <p className="mt-1 text-sm text-gray-500">{order.description}</p>
                  )}
                  {order.notes && (
                    <p className="mt-1 rounded-md bg-yellow-50 px-2 py-1 text-sm text-yellow-800 ring-1 ring-yellow-200">
                      <span className="font-medium">Note :</span> {order.notes}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Par {order.admin.name} &middot; {order.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <form action={deleteOrderAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && view === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Titre</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Assigne a</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Par</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {order.title}
                      {order.description && (
                        <div className="text-xs font-normal text-gray-500">{order.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.type === "CONFIRMATION"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "DONE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "DONE" ? "Termine" : "En cours"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.assignedTo?.name ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-700">
                      {order.notes ? (
                        <span className="line-clamp-2 text-xs text-yellow-800">{order.notes}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.admin.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.createdAt.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteOrderAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 text-sm text-gray-600">
            <p>
              Page <span className="font-medium">{page}</span> sur{" "}
              <span className="font-medium">{totalPages}</span> &middot;{" "}
              {total} ordres
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={buildHref({ page: page - 1 })}
                  className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-gray-200 transition hover:bg-gray-50"
                >
                  Precedent
                </Link>
              ) : (
                <span className="rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400 ring-1 ring-gray-200">
                  Precedent
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={buildHref({ page: page + 1 })}
                  className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-gray-200 transition hover:bg-gray-50"
                >
                  Suivant
                </Link>
              ) : (
                <span className="rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400 ring-1 ring-gray-200">
                  Suivant
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
