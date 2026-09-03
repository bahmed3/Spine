import Link from "next/link";
import { SignInButton } from "@/components/SignInButton";
import { CurrentlyReadingHero } from "@/components/CurrentlyReadingHero";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-brass mb-5">
          Track. Shelve. Discover.
        </p>
        <h1 className="font-serif font-medium text-4xl sm:text-5xl max-w-2xl leading-tight mb-6">
          The social home for readers
        </h1>
        <p className="text-paper-dim max-w-md mb-10 leading-relaxed">
          Track what you&apos;re reading, build public shelves worth
          browsing, and find your next book through people, not just an
          algorithm.
        </p>

        <div className="flex items-center gap-4">
          <SignInButton />
          <Link
            href="/discover"
            className="text-sm text-paper-dim hover:text-paper transition"
          >
            Browse without an account →
          </Link>
        </div>
      </main>
    );
  }

  // Signed in: pull this user's active reading entry, if any.
  const { data: entry } = await supabase
    .from("reading_entries")
    .select("current_page, total_pages, books(id, title, author, cover_url)")
    .eq("user_id", user.id)
    .eq("status", "reading")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="flex-1 max-w-[900px] w-full mx-auto px-8 py-9 pb-20">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CurrentlyReadingHero entry={entry as any} />

      <div className="text-center text-paper-dim text-sm">
        <Link href="/discover" className="text-brass hover:underline">
          Browse Discover
        </Link>{" "}
        to start a new book — shelves and the friend feed are still on the
        way.
      </div>
    </main>
  );
}
