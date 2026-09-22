"use client";

import { useTransition } from "react";
import { removeBookFromShelf } from "@/lib/actions/shelves";

export function RemoveFromShelfButton({
  shelfId,
  bookId,
}: {
  shelfId: string;
  bookId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => removeBookFromShelf(shelfId, bookId))}
      disabled={isPending}
      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-ink/80 text-paper text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center disabled:opacity-50"
      title="Remove from shelf"
    >
      ×
    </button>
  );
}
