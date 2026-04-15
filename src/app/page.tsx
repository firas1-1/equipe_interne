import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(session.isAdmin ? "/admin" : "/equipe");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Equipe Interne</h1>
          <p className="mt-2 text-blue-200">
            Gestion E-Commerce &mdash; Confirmation &amp; Reclamation
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
