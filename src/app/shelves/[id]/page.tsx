import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RemoveFromShelfButton } from "@/components/RemoveFromShelfButton";

export default async function ShelfDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shelf } = await supabase
    .from("shelves")
    .select(
      "id, name, description, is_public, user_id, profiles(display_name), shelf_books(book_id, books(id, title, author, cover_url))"
    )
    .eq("id", id)
    .maybeSingle();

  // RLS already hides private shelves from non-owners at the query level,
  // so a null result here means either it doesn't exist or isn't visible
  // to this viewer - either way, a 404 is the honest response.
  if (!shelf) notFound();

  const isOwner = user?.id === shelf.user_id;
  const owner = Array.isArray(shelf.profiles) ? shelf.profiles[0] : shelf.profiles;

  return (
    <main className="flex-1 max-w-[900px] w-full mx-auto px-8 py-10 pb-20">
      <Link href="/shelves" className="text-xs text-paper-dim font-mono">
        ← back to shelves
      </Link>

      <div className="flex items-start justify-between mt-4 mb-2">
        <div>
          <h1 className="font-serif font-medium text-[28px] mb-1">
            {shelf.name}
          </h1>
          {owner?.display_name && (
            <p className="text-sm text-paper-dim">
              by {owner.display_name}
              {!shelf.is_public && " · Private"}
            </p>
          )}
        </div>
      </div>

      {shelf.description && (
        <p className="text-paper-dim text-sm mb-8 max-w-lg">
          {shelf.description}
        </p>
      )}

      {shelf.shelf_books && shelf.shelf_books.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
          {shelf.shelf_books.map((entry) => {
            const book = Array.isArray(entry.books) ? entry.books[0] : entry.books;
            if (!book) return null;
            return (
              <div key={book.id} className="group relative">
                <div className="w-full aspect-[2/3] rounded-md overflow-hidden bg-ink-3 mb-2">
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center text-[11px] text-paper-dim">
                      {book.title}
                    </div>
                  )}
                  {isOwner && (
                    <RemoveFromShelfButton shelfId={shelf.id} bookId={book.id} />
                  )}
                </div>
                <p className="text-xs font-medium leading-snug line-clamp-2">
                  {book.title}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-paper-dim">
          No books on this shelf yet.{" "}
          {isOwner && (
            <>
              Head to{" "}
              <Link href="/discover" className="text-brass hover:underline">
                Discover
              </Link>{" "}
              and add some.
            </>
          )}
        </p>
      )}
    </main>
  );
}
