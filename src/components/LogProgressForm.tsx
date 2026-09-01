"use client";

import { useState, useTransition } from "react";
import { logProgress } from "@/lib/actions/reading";

export function LogProgressForm({
  bookId,
  currentPage,
  totalPages,
}: {
  bookId: string;
  currentPage: number | null;
  totalPages: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(currentPage?.toString() ?? "");
  const [total, setTotal] = useState(totalPages?.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pageNum = parseInt(page, 10);
    const totalNum = total ? parseInt(total, 10) : undefined;
    if (Number.isNaN(pageNum)) return;

    startTransition(async () => {
      await logProgress(bookId, pageNum, totalNum);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-brass text-ink whitespace-nowrap"
      >
        Log pages
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Page"
        value={page}
        onChange={(e) => setPage(e.target.value)}
        autoFocus
        className="w-16 bg-ink-3 border border-line-strong rounded-md px-2 py-1.5 text-sm text-paper outline-none"
      />
      <span className="text-paper-dim text-sm">/</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Total"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        className="w-16 bg-ink-3 border border-line-strong rounded-md px-2 py-1.5 text-sm text-paper outline-none"
      />
      <button
        type="submit"
        disabled={isPending || !page}
        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-brass text-ink disabled:opacity-50"
      >
        {isPending ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-paper-dim px-1"
      >
        Cancel
      </button>
    </form>
  );
}
