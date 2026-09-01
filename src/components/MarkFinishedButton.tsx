"use client";

import { useTransition } from "react";
import { markFinished } from "@/lib/actions/reading";

export function MarkFinishedButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markFinished(bookId))}
      disabled={isPending}
      className="text-sm font-medium px-4 py-2 rounded-lg border border-line-strong hover:bg-ink-3 transition disabled:opacity-50 whitespace-nowrap"
    >
      {isPending ? "Saving…" : "Mark finished"}
    </button>
  );
}
