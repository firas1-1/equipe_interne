import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function EquipeProfilPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, createdAt: true },
  });
  if (!user) redirect("/");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mon Profil</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">
              Membre depuis le {user.createdAt.toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Modifier mes informations
        </h2>
        <ProfileForm user={{ name: user.name, email: user.email }} />
      </div>
    </div>
  );
}
