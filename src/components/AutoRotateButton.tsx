"use client";

import { autoRotateRoles } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function AutoRotateButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await autoRotateRoles();
      if (result.success) {
        setMessage({ type: "success", text: "Roles de demain assignes avec succes" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "En cours..." : "Rotation auto demain"}
      </button>
      {message && (
        <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
