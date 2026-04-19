"use client";

import { deleteOrder } from "@/lib/actions";
import Link from "next/link";
import { useState, useTransition } from "react";

type Order = {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  type: "CONFIRMATION" | "RECLAMATION";
  status: "PENDING" | "DONE";
  createdAt: Date;
  admin: { name: string };
  assignedTo: { name: string } | null;
};

export default function OrdersList({
  orders,
  total,
  page,
  totalPages,
  pageSize,
}: {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteOrder(fd);
      setPendingId(null);
    });
  }

  const pageHref = (p: number) => `/admin?page=${p}`;

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Tous les Ordres ({total})
        </h2>
        <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-gray-200">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === "cards"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cartes
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Tableau
          </button>
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
                  Par {order.admin.name} &middot;{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(order.id)}
                disabled={pendingId === order.id}
                className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {pendingId === order.id ? "..." : "Supprimer"}
              </button>
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
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      disabled={pendingId === order.id}
                      className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {pendingId === order.id ? "..." : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > pageSize && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 text-sm text-gray-600">
          <p>
            Page <span className="font-medium">{page}</span> sur{" "}
            <span className="font-medium">{totalPages}</span> &middot; {total} ordres
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
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
                href={pageHref(page + 1)}
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
  );
}
