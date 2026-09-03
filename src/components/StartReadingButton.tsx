"use client";

import { useState, useTransition } from "react";
import { startReading } from "@/lib/actions/reading";
import type { OpenLibraryBook } from "@/lib/api/openLibrary";

export function StartReadingButton({ book }: { book: OpenLibraryBook }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      try {
        await startReading(book);
        setState("done");
      } catch (err) {
        // Surface the real error instead of guessing "sign in first" -
        // it might be a network hiccup, an RLS issue, etc. and hiding
        // that behind a generic message makes real bugs hard to spot.
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
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
      {state === "error" && errorMessage && (
        <span className="block text-oxblood-light text-[10px] mt-0.5 max-w-[110px] whitespace-normal">
          {errorMessage}
        </span>
      )}
    </button>
  );
}
