import Link from "next/link";
import { MarkFinishedButton } from "@/components/MarkFinishedButton";

type Entry = {
  current_page: number | null;
  books: {
    id: string;
    title: string;
    author: string | null;
    cover_url: string | null;
  } | null;
};

export function CurrentlyReadingHero({ entry }: { entry: Entry | null }) {
  if (!entry || !entry.books) {
    return (
      <div className="bg-ink-2 border border-line rounded-[14px] p-7 flex items-center justify-between gap-6 mb-11">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-brass mb-2">
            Nothing on deck
          </p>
          <p className="font-serif text-xl">
            You&apos;re not currently reading anything
          </p>
        </div>
        <Link
          href="/discover"
          className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-brass text-ink whitespace-nowrap"
        >
          Find a book
        </Link>
      </div>
    );
  }

  const book = entry.books;

  return (
    <div className="bg-ink-2 border border-line rounded-[14px] p-7 flex items-center gap-6 mb-11 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brass" />
      <div
        className="w-[74px] h-[108px] rounded-[3px] flex-shrink-0 bg-ink-3 overflow-hidden"
        style={!book.cover_url ? { background: "#3a4a63" } : undefined}
      >
        {book.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] tracking-widest uppercase text-brass mb-1.5">
          Currently reading
        </p>
        <h2 className="font-serif font-medium text-2xl mb-1 truncate">
          {book.title}
        </h2>
        <p className="text-paper-dim text-sm mb-3">{book.author}</p>
        {entry.current_page != null && (
          <p className="font-mono text-xs text-paper-dim">
            Page {entry.current_page}
          </p>
        )}
      </div>
      <MarkFinishedButton bookId={book.id} />
    </div>
  );
}
