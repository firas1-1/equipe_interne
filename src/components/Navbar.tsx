"use client";

import { logout } from "@/lib/actions";
import Link from "next/link";

export default function Navbar({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={isAdmin ? "/admin" : "/equipe"} className="text-xl font-bold text-blue-600">
            Equipe Interne
          </Link>
          {isAdmin && (
            <div className="hidden gap-4 sm:flex">
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Ordres
              </Link>
              <Link href="/admin/equipe" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Equipe
              </Link>
              <Link href="/admin/kilometres" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Kilometres
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {userName}{" "}
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {isAdmin ? "Admin" : "Equipe"}
            </span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Deconnexion
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
