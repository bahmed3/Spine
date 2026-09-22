"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { addBookToShelf } from "@/lib/actions/shelves";
import type { OpenLibraryBook } from "@/lib/api/openLibrary";

type Shelf = { id: string; name: string };

export function AddToShelfButton({
  book,
  shelves,
  signedIn,
}: {
  book: OpenLibraryBook;
  shelves: Shelf[];
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addedShelfIds, setAddedShelfIds] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click or on scroll (scrolling would leave a
  // portal-rendered dropdown floating in the wrong spot otherwise,
  // since it's no longer anchored in normal document flow).
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  if (!signedIn) return null;

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  }

  function handleAdd(shelfId: string) {
    startTransition(async () => {
      await addBookToShelf(shelfId, book);
      setAddedShelfIds((prev) => new Set(prev).add(shelfId));
      setOpen(false);
    });
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        disabled={isPending}
        className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-line-strong text-paper-dim hover:text-paper transition disabled:opacity-50"
      >
        {addedShelfIds.size > 0 ? "✓ On a shelf" : "+ Shelf"}
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: position.top, left: position.left }}
            className="w-44 bg-ink-3 border border-line-strong rounded-md shadow-xl py-1 z-[9999]"
          >
            {shelves.length === 0 ? (
              <Link
                href="/shelves"
                className="block px-3 py-2 text-xs text-paper-dim hover:text-paper"
              >
                Create a shelf first →
              </Link>
            ) : (
              shelves.map((shelf) => {
                const isAdded = addedShelfIds.has(shelf.id);
                return (
                  <button
                    key={shelf.id}
                    onClick={() => !isAdded && handleAdd(shelf.id)}
                    className="flex items-center justify-between w-full text-left px-3 py-2 text-xs text-paper hover:bg-ink-2 disabled:opacity-50"
                  >
                    <span>{shelf.name}</span>
                    {isAdded && <span className="text-brass">✓</span>}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </>
  );
}
