import type { OpenLibraryBook } from "@/lib/api/openLibrary";
import { StartReadingButton } from "@/components/StartReadingButton";

const FALLBACK_TONES = [
  "#4A5D7A",
  "#8C2F39",
  "#5B7A5D",
  "#C9A227",
  "#5C4A7A",
  "#3E6B6B",
  "#8C5A2F",
  "#6B4A5C",
];

function fallbackTone(key: string) {
  const sum = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_TONES[sum % FALLBACK_TONES.length];
}

export function BookCard({
  book,
  rank,
}: {
  book: OpenLibraryBook;
  rank?: number;
}) {
  return (
    <div className="flex-shrink-0 w-[132px] group">
      <div
        className="w-[132px] h-[190px] rounded-[5px] mb-2.5 relative overflow-hidden bg-ink-3"
        style={!book.coverUrl ? { background: fallbackTone(book.key) } : undefined}
      >
        {book.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        )}
        {rank && (
          <span className="absolute top-2 left-2 font-serif font-semibold text-[13px] w-[22px] h-[22px] rounded-full bg-ink/70 flex items-center justify-center">
            {rank}
          </span>
        )}
      </div>
      <div className="text-[13px] font-medium leading-snug line-clamp-2">
        {book.title}
      </div>
      <div className="text-[11px] text-paper-dim mb-2">{book.author}</div>
      <StartReadingButton book={book} />
    </div>
  );
}
