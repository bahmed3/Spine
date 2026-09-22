import { getTrendingBooks, searchBooks } from "@/lib/api/openLibrary";
import { BookCard } from "@/components/BookCard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const GENRES = [
  "fiction",
  "fantasy",
  "nonfiction",
  "memoir",
  "poetry",
  "mystery",
  "literary_fiction",
];

function genreLabel(genre: string) {
  return genre.replace("_", " ");
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; q?: string }>;
}) {
  const { genre = "fiction", q } = await searchParams;
  const supabase = await createClient();

  const [
    { data: userData },
    trending,
    searchResults,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getTrendingBooks(genre, 12),
    q ? searchBooks(q, 12) : Promise.resolve([]),
  ]);

  const user = userData.user;
  let shelves: { id: string; name: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("shelves")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    shelves = data ?? [];
  }

  return (
    <main className="flex-1 max-w-[1080px] w-full mx-auto px-8 py-9 pb-20">
      <div className="mb-9">
        <p className="font-mono text-xs tracking-widest uppercase text-brass mb-2">
          Discover
        </p>
        <h1 className="font-serif font-medium text-3xl mb-5">
          Find your next read
        </h1>

        <form action="/discover" className="max-w-lg mb-5">
          <input type="hidden" name="genre" value={genre} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search titles, authors, genres…"
            className="w-full bg-ink-2 border border-line rounded-[9px] px-4 py-3 text-sm text-paper placeholder:text-paper-dim outline-none focus:border-line-strong"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g}
              href={`/discover?genre=${g}`}
              className={`text-[13px] px-4 py-2 rounded-full border capitalize whitespace-nowrap transition ${
                g === genre
                  ? "bg-brass text-ink border-brass font-semibold"
                  : "border-line-strong text-paper-dim hover:text-paper"
              }`}
            >
              {genreLabel(g)}
            </Link>
          ))}
        </div>
      </div>

      {q && (
        <section className="mb-11">
          <h2 className="font-serif font-medium text-[19px] mb-4">
            Results for &ldquo;{q}&rdquo;
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-sm text-paper-dim">
              No books found. Try a different title or author.
            </p>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-2">
              {searchResults.map((book) => (
                <BookCard
                  key={book.key}
                  book={book}
                  shelves={shelves}
                  signedIn={!!user}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mb-11">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-serif font-medium text-[19px]">
              Trending in {genreLabel(genre)}
            </h2>
            <p className="text-xs text-paper-dim mt-0.5">
              Live from Open Library
            </p>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {trending.map((book, i) => (
            <BookCard
              key={book.key}
              book={book}
              rank={i + 1}
              shelves={shelves}
              signedIn={!!user}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
