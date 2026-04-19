import { prisma } from "@/lib/prisma";
import OrderFormClient from "@/components/OrderFormClient";
import OrdersList from "@/components/OrdersList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ page?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Gestion des Ordres</h1>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Nouvel Ordre</h2>
        <OrderFormClient members={members} />
      </div>

      <OrdersList
        orders={orders}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
