"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type BookInput = {
  key: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

// Marks a book as "currently reading" for the signed-in user. Caches
// the book's basic info in our own `books` table the first time it's
// shelved/started, so future queries don't depend on Open Library.
export async function startReading(book: BookInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to be signed in to start reading a book.");
  }

  const { error: bookError } = await supabase.from("books").upsert({
    id: book.key,
    title: book.title,
    author: book.author,
    cover_url: book.coverUrl,
  });
  if (bookError) throw bookError;

  const { error: entryError } = await supabase.from("reading_entries").upsert(
    {
      user_id: user.id,
      book_id: book.key,
      status: "reading",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" }
  );
  if (entryError) throw entryError;

  revalidatePath("/");
}

// Updates page progress on a book the user is currently reading.
export async function logProgress(bookId: string, currentPage: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to log progress.");

  const { error } = await supabase
    .from("reading_entries")
    .update({ current_page: currentPage, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("book_id", bookId);
  if (error) throw error;

  revalidatePath("/");
}

// Marks a book as finished.
export async function markFinished(bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to do that.");

  const { error } = await supabase
    .from("reading_entries")
    .update({
      status: "finished",
      finished_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("book_id", bookId);
  if (error) throw error;

  revalidatePath("/");
}
