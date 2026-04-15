"use client";

import { login, register } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      try {
        if (mode === "login") {
          await login(formData);
        } else {
          await register(formData);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue");
      }
    });
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
        {mode === "login" ? "Connexion" : "Inscription"}
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="Votre nom"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="email@exemple.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {mode === "register" && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input name="isAdmin" type="checkbox" className="rounded" />
            Compte administrateur
          </label>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending
            ? "Chargement..."
            : mode === "login"
              ? "Se connecter"
              : "S'inscrire"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        {mode === "login" ? "Pas de compte ? " : "Deja inscrit ? "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="font-medium text-blue-600 hover:underline"
        >
          {mode === "login" ? "S'inscrire" : "Se connecter"}
        </button>
      </p>
    </div>
  );
}
