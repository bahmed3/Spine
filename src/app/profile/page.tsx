import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReadingRhythmChart } from "@/components/ReadingRhythmChart";
import { BookSpine } from "@/components/BookSpine";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [
    { data: profile },
    { count: finishedCount },
    { count: readingCount },
    { data: reviews },
    { data: recentFinished },
    { data: yearFinishedDates },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("reading_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "finished"),
    supabase
      .from("reading_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "reading"),
    supabase.from("reviews").select("rating").eq("user_id", user.id),
    supabase
      .from("reading_entries")
      .select("finished_at, books(id, title, author, cover_url)")
      .eq("user_id", user.id)
      .eq("status", "finished")
      .order("finished_at", { ascending: false })
      .limit(10),
    supabase
      .from("reading_entries")
      .select("finished_at")
      .eq("user_id", user.id)
      .eq("status", "finished")
      .gte("finished_at", `${new Date().getFullYear()}-01-01`),
  ]);

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Reader";
  const readerSinceYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const finishedThisYear = yearFinishedDates?.length ?? 0;

  const monthlyCounts = Array(12).fill(0);
  yearFinishedDates?.forEach((row) => {
    if (row.finished_at) {
      const month = new Date(row.finished_at).getMonth();
      monthlyCounts[month]++;
    }
  });

  return (
    <main className="flex-1 max-w-[960px] w-full mx-auto px-8 py-10 pb-20">
      {/* HEADER */}
      <div className="flex gap-7 items-end pb-7 border-b border-line mb-9">
        <div className="w-24 h-24 rounded-full bg-brass text-ink font-serif font-semibold text-4xl flex items-center justify-center flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-brass mb-1.5">
            Reader since {readerSinceYear}
          </p>
          <h1 className="font-serif font-medium text-[32px]">{displayName}</h1>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="grid grid-cols-4 gap-px bg-line border border-line rounded-xl overflow-hidden mb-11">
        <div className="bg-ink-2 px-5 py-5">
          <div className="font-serif font-medium text-[28px] text-brass">
            {finishedCount ?? 0}
          </div>
          <div className="text-xs text-paper-dim mt-1">Books finished</div>
        </div>
        <div className="bg-ink-2 px-5 py-5">
          <div className="font-serif font-medium text-[28px] text-brass">
            {finishedThisYear}
          </div>
          <div className="text-xs text-paper-dim mt-1">Finished this year</div>
        </div>
        <div className="bg-ink-2 px-5 py-5">
          <div className="font-serif font-medium text-[28px] text-brass">
            {readingCount ?? 0}
          </div>
          <div className="text-xs text-paper-dim mt-1">Currently reading</div>
        </div>
        <div className="bg-ink-2 px-5 py-5">
          <div className="font-serif font-medium text-[28px] text-brass">
            {avgRating}
          </div>
          <div className="text-xs text-paper-dim mt-1">Average rating given</div>
        </div>
      </div>

      {/* READING RHYTHM */}
      <div className="mb-11">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif font-medium text-[19px]">Reading rhythm</h2>
          <span className="font-mono text-xs text-paper-dim">
            {new Date().getFullYear()}
          </span>
        </div>
        <ReadingRhythmChart monthlyCounts={monthlyCounts} />
      </div>

      {/* RECENTLY FINISHED */}
      <div className="mb-11">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif font-medium text-[19px]">Recently finished</h2>
          <Link href="/discover" className="text-xs text-paper-dim font-mono">
            find more →
          </Link>
        </div>
        {recentFinished && recentFinished.length > 0 ? (
          <div className="flex items-end gap-2 bg-ink-2 border border-line rounded-xl p-5 overflow-x-auto">
            {recentFinished.map((entry, i) => {
              const book = Array.isArray(entry.books) ? entry.books[0] : entry.books;
              if (!book) return null;
              return (
                <BookSpine
                  key={`${book.id}-${i}`}
                  id={book.id}
                  title={book.title}
                  coverUrl={book.cover_url}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-ink-2 border border-line rounded-xl p-6 text-sm text-paper-dim">
            Nothing finished yet.{" "}
            <Link href="/discover" className="text-brass hover:underline">
              Find a book
            </Link>{" "}
            and mark it finished once you&apos;re done to see it here.
          </div>
        )}
      </div>

      {/* SHELVES - not built yet, honest placeholder */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif font-medium text-[19px]">Shelves</h2>
        </div>
        <div className="bg-ink-2 border border-line rounded-xl p-6 text-sm text-paper-dim">
          Shelves are coming next — you&apos;ll be able to group books into
          public collections here.
        </div>
      </div>
    </main>
  );
}
