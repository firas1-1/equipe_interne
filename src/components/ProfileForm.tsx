"use client";

import { updateProfile } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function ProfileForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setMessage({ type: "success", text: "Profil mis a jour avec succes" });
      } catch (e: unknown) {
        setMessage({
          type: "error",
          text: e instanceof Error ? e.message : "Une erreur est survenue",
        });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          name="name"
          required
          defaultValue={user.name}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          defaultValue={user.email}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Mot de passe actuel <span className="text-red-500">*</span>
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          placeholder="Requis pour confirmer les changements"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nouveau mot de passe{" "}
          <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          name="newPassword"
          type="password"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          placeholder="Laisser vide pour ne pas changer"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
