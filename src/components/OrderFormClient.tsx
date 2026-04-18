"use client";

import { createOrder } from "@/lib/actions";
import { useRef, useState, useTransition } from "react";

export default function OrderFormClient({
  members,
}: {
  members: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createOrder(formData);
      if (result.success) {
        formRef.current?.reset();
        setMessage({ type: "success", text: "Ordre cree avec succes" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {message && (
        <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ring-1 ${
          message.type === "success"
            ? "bg-green-50 text-green-700 ring-green-200"
            : "bg-red-50 text-red-700 ring-red-200"
        }`}>
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {message.type === "success" ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Titre de l'ordre"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="CONFIRMATION">Confirmation</option>
            <option value="RECLAMATION">Reclamation</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Assigner a un membre{" "}
          <span className="font-normal text-gray-400">(optionnel)</span>
        </label>
        <select
          name="assignedUserId"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
          <option value="">— Tous les membres du role —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          placeholder="Description (optionnel)"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Creer l'ordre"}
      </button>
    </form>
  );
}
