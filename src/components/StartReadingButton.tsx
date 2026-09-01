"use client";

import { useState, useTransition } from "react";
import { startReading } from "@/lib/actions/reading";
import type { OpenLibraryBook } from "@/lib/api/openLibrary";

export function StartReadingButton({ book }: { book: OpenLibraryBook }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  function handleClick() {
    startTransition(async () => {
      try {
        await startReading(book);
        setState("done");
      } catch {
        setState("error");
      }
    });
  }

  if (state === "done") {
    return (
      <span className="text-[11px] text-brass font-medium">
        Added to currently reading
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-ink-3 hover:bg-brass hover:text-ink transition disabled:opacity-50"
    >
      {isPending ? "Adding…" : "Start reading"}
      {state === "error" && (
        <span className="block text-oxblood-light text-[10px] mt-0.5">
          Sign in first
        </span>
      )}
    </button>
  );
}
