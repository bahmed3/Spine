// Thin client for the Open Library API — free, no key required.
// Docs: https://openlibrary.org/dev/docs/api/search

export type OpenLibraryBook = {
  key: string; // e.g. "/works/OL45804W" - use as our stable book id
  title: string;
  author: string;
  coverUrl: string | null;
  firstPublishYear: number | null;
};

type SearchDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

type SearchResponse = {
  docs: SearchDoc[];
};

function coverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function toBook(doc: SearchDoc): OpenLibraryBook {
  return {
    key: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown author",
    coverUrl: coverUrl(doc.cover_i),
    firstPublishYear: doc.first_publish_year ?? null,
  };
}

export async function searchBooks(
  query: string,
  limit = 10
): Promise<OpenLibraryBook[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    "key,title,author_name,cover_i,first_publish_year"
  );

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);

  const data = (await res.json()) as SearchResponse;
  return data.docs.map(toBook);
}

export async function getTrendingBooks(
  subject = "fiction",
  limit = 10
): Promise<OpenLibraryBook[]> {
  // Open Library doesn't have a "trending" endpoint, so in production
  // this would likely be backed by our own Postgres aggregate of what
  // Spine's own readers are shelving/starting - falling back to a
  // subject search here for the mockup/demo data.
  const url = new URL(`https://openlibrary.org/subjects/${subject}.json`);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) throw new Error(`Open Library subjects failed: ${res.status}`);

  const data = (await res.json()) as {
    works: {
      key: string;
      title: string;
      authors?: { name: string }[];
      cover_id?: number;
      first_publish_year?: number;
    }[];
  };

  return data.works.map((w) => ({
    key: w.key,
    title: w.title,
    author: w.authors?.[0]?.name ?? "Unknown author",
    coverUrl: coverUrl(w.cover_id),
    firstPublishYear: w.first_publish_year ?? null,
  }));
}
