import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateShelfForm } from "@/components/CreateShelfForm";

export default async function ShelvesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: shelves } = await supabase
    .from("shelves")
    .select("id, name, description, is_public, shelf_books(book_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 max-w-[900px] w-full mx-auto px-8 py-10 pb-20">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-serif font-medium text-[28px]">Your shelves</h1>
      </div>
      <p className="text-paper-dim text-sm mb-7">
        Group books into collections. Public shelves show up on your profile
        for anyone to browse.
      </p>

      <CreateShelfForm />

      {shelves && shelves.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shelves.map((shelf) => (
            <Link
              key={shelf.id}
              href={`/shelves/${shelf.id}`}
              className="bg-ink-2 border border-line rounded-xl p-5 hover:border-line-strong transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-medium text-[15px]">{shelf.name}</h2>
                {!shelf.is_public && (
                  <span className="font-mono text-[10px] text-paper-dim uppercase tracking-wide">
                    Private
                  </span>
                )}
              </div>
              {shelf.description && (
                <p className="text-xs text-paper-dim mb-3 line-clamp-2">
                  {shelf.description}
                </p>
              )}
              <p className="font-mono text-xs text-brass">
                {shelf.shelf_books?.length ?? 0} book
                {shelf.shelf_books?.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-paper-dim">
          No shelves yet — create your first one above.
        </p>
      )}
    </main>
  );
}
