"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createShelf } from "@/lib/actions/shelves";

export function CreateShelfForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const id = await createShelf(name, description, isPublic);
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/shelves/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-brass text-ink whitespace-nowrap mb-6"
      >
        New shelf +
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ink-2 border border-line rounded-xl p-5 mb-6 flex flex-col gap-3"
    >
      <input
        type="text"
        placeholder="Shelf name (e.g. Rainy day comfort)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="bg-ink-3 border border-line-strong rounded-md px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim outline-none"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="bg-ink-3 border border-line-strong rounded-md px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim outline-none resize-none"
      />
      <label className="flex items-center gap-2 text-sm text-paper-dim">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="accent-brass"
        />
        Make this shelf public (anyone can view it)
      </label>
      {error && <p className="text-xs text-oxblood-light">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-brass text-ink disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create shelf"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-paper-dim"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
