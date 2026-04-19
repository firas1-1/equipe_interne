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
  const profileHref = isAdmin ? "/admin/profil" : "/equipe/profil";

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={isAdmin ? "/admin" : "/equipe"} className="text-xl font-bold text-blue-600">
            Equipe Interne
          </Link>
          <span className="hidden text-xs text-gray-400 sm:block">E-Commerce</span>
          {isAdmin && (
            <div className="hidden gap-4 sm:flex">
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Ordres
              </Link>
              <Link href="/admin/equipe" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Equipe
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={profileHref}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">{userName}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {isAdmin ? "Admin" : "Equipe"}
            </span>
          </Link>
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
