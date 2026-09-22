"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShelf(
  name: string,
  description: string,
  isPublic: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to create a shelf.");
  if (!name.trim()) throw new Error("Give your shelf a name.");

  const { data, error } = await supabase
    .from("shelves")
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      is_public: isPublic,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/shelves");
  revalidatePath("/profile");
  return data.id as string;
}

type BookInput = {
  key: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

export async function addBookToShelf(shelfId: string, book: BookInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to do that.");

  // Cache the book first (same pattern as startReading) so shelf_books
  // can foreign-key against it even if it's never been shelved before.
  const { error: bookError } = await supabase.from("books").upsert(
    {
      id: book.key,
      title: book.title,
      author: book.author,
      cover_url: book.coverUrl,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (bookError) throw bookError;

  const { error } = await supabase.from("shelf_books").upsert(
    { shelf_id: shelfId, book_id: book.key },
    { onConflict: "shelf_id,book_id", ignoreDuplicates: true }
  );
  if (error) throw error;

  revalidatePath(`/shelves/${shelfId}`);
  revalidatePath("/discover");
}

export async function removeBookFromShelf(shelfId: string, bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to do that.");

  const { error } = await supabase
    .from("shelf_books")
    .delete()
    .eq("shelf_id", shelfId)
    .eq("book_id", bookId);
  if (error) throw error;

  revalidatePath(`/shelves/${shelfId}`);
}
