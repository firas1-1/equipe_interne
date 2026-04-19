import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toggleOrderDone } from "@/lib/actions";

async function toggleAction(formData: FormData): Promise<void> {
  "use server";
  await toggleOrderDone(formData);
}

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      assignments: { where: { date: today } },
    },
  });

  if (!user) redirect("/");

  const todayRole = user.assignments[0]?.roleType || null;

  const orders = await prisma.order.findMany({
    where: {
      ...(todayRole ? { type: todayRole } : {}),
      OR: [
        { assignedUserId: null },
        { assignedUserId: session.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Mon role aujourd&apos;hui</p>
          {todayRole ? (
            <p
              className={`mt-1 text-xl font-bold ${
                todayRole === "CONFIRMATION"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {todayRole}
            </p>
          ) : (
            <p className="mt-1 text-xl font-bold text-gray-400">Non assigne</p>
          )}
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Ordres a traiter</p>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "PENDING").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {todayRole
              ? `Ordres ${todayRole}`
              : "Tous les ordres"}
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
              className={`flex items-center gap-4 px-6 py-4 ${
                order.status === "DONE" ? "bg-gray-50" : ""
              }`}
            >
              <form action={toggleAction}>
                <input type="hidden" name="id" value={order.id} />
                <button
                  type="submit"
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                    order.status === "DONE"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {order.status === "DONE" && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              </form>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      order.status === "DONE"
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {order.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.type === "CONFIRMATION"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.type}
                  </span>
                  {order.assignedTo && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Pour moi
                    </span>
                  )}
                </div>
                {order.description && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    {order.description}
                  </p>
                )}
                {order.notes && (
                  <p className="mt-1 rounded-md bg-yellow-50 px-2 py-1 text-sm text-yellow-800 ring-1 ring-yellow-200">
                    <span className="font-medium">Note :</span> {order.notes}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  Par {order.admin.name} &middot;{" "}
                  {order.createdAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
