"use client";

import { createMember } from "@/lib/actions";
import { useRef, useState, useTransition } from "react";

export default function CreateMemberForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createMember(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Compte cree avec succes" });
        formRef.current?.reset();
      } else {
        setMessage({ type: "error", text: result.error ?? "Erreur" });
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Nom complet"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="email@exemple.com"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          placeholder="Min. 6 caracteres"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input name="isAdmin" type="checkbox" className="rounded" />
        Compte administrateur
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Creation..." : "Creer le compte"}
      </button>
    </form>
  );
}
