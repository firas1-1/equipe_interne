import { prisma } from "@/lib/prisma";
import { deleteOrder } from "@/lib/actions";
import OrderFormClient from "@/components/OrderFormClient";

async function deleteOrderAction(formData: FormData): Promise<void> {
  "use server";
  await deleteOrder(formData);
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Gestion des Ordres
      </h1>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Nouvel Ordre
        </h2>
        <OrderFormClient />
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tous les Ordres ({orders.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400">
              Aucun ordre pour le moment
            </p>
          )}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{order.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.type === "CONFIRMATION"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "DONE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status === "DONE" ? "Termine" : "En cours"}
                  </span>
                </div>
                {order.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {order.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Par {order.admin.name} &middot;{" "}
                  {order.createdAt.toLocaleDateString("fr-FR")}
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
      </div>
    </div>
  );
}
