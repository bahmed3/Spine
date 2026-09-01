-- Spine initial schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- or via the Supabase CLI: supabase db push

-- ============================================================
-- PROFILES
-- One row per user, extending Supabase's built-in auth.users.
-- Created automatically via trigger when someone signs up.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- BOOKS
-- A local cache of Open Library data so we're not re-fetching
-- on every page view, and so shelves/reviews can foreign-key to
-- something stable. id = the Open Library work key, e.g. "/works/OL45804W"
-- ============================================================
create table public.books (
  id text primary key,
  title text not null,
  author text,
  cover_url text,
  first_publish_year int,
  cached_at timestamptz not null default now()
);

-- ============================================================
-- SHELVES
-- User-created collections of books. Public by default per
-- the "shelves are a social/discoverable thing" decision.
-- ============================================================
create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shelf_books (
  shelf_id uuid not null references public.shelves(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  primary key (shelf_id, book_id)
);

-- ============================================================
-- READING ENTRIES
-- Tracks a user's relationship to a book: want to read, currently
-- reading (with page progress), finished, or did-not-finish.
-- Powers the homepage "currently reading" hero and profile stats.
-- ============================================================
create type reading_status as enum ('want_to_read', 'reading', 'finished', 'dnf');

create table public.reading_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  status reading_status not null default 'want_to_read',
  current_page int,
  total_pages int,
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ============================================================
-- REVIEWS
-- One review+rating per user per book.
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ============================================================
-- FOLLOWS
-- The social graph that powers "friend activity".
-- ============================================================
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============================================================
-- INDEXES for the query patterns the app actually uses
-- ============================================================
create index shelf_books_book_id_idx on public.shelf_books(book_id);
create index reading_entries_user_status_idx on public.reading_entries(user_id, status);
create index reviews_book_id_idx on public.reviews(book_id);
create index follows_following_id_idx on public.follows(following_id);
create index shelves_user_id_idx on public.shelves(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Everything readable if public; writable only by its owner.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.shelves enable row level security;
alter table public.shelf_books enable row level security;
alter table public.reading_entries enable row level security;
alter table public.reviews enable row level security;
alter table public.follows enable row level security;

-- Profiles: anyone can view; only the owner can edit their own
create policy "Profiles are publicly readable" on public.profiles
  for select using (true);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Books: publicly readable cache; any signed-in user can add a new
-- book to the cache (e.g. the first time someone shelves it)
create policy "Books are publicly readable" on public.books
  for select using (true);
create policy "Signed-in users can cache new books" on public.books
  for insert with check (auth.role() = 'authenticated');

-- Shelves: public shelves are readable by anyone; private shelves only
-- by their owner. Only the owner can create/edit/delete their shelves.
create policy "Public shelves are readable by everyone" on public.shelves
  for select using (is_public or auth.uid() = user_id);
create policy "Users manage their own shelves" on public.shelves
  for insert with check (auth.uid() = user_id);
create policy "Users update their own shelves" on public.shelves
  for update using (auth.uid() = user_id);
create policy "Users delete their own shelves" on public.shelves
  for delete using (auth.uid() = user_id);

-- Shelf books follow the same visibility as their parent shelf
create policy "Shelf books visible if the shelf is visible" on public.shelf_books
  for select using (
    exists (
      select 1 from public.shelves
      where shelves.id = shelf_books.shelf_id
      and (shelves.is_public or shelves.user_id = auth.uid())
    )
  );
create policy "Users add books to their own shelves" on public.shelf_books
  for insert with check (
    exists (
      select 1 from public.shelves
      where shelves.id = shelf_id and shelves.user_id = auth.uid()
    )
  );
create policy "Users remove books from their own shelves" on public.shelf_books
  for delete using (
    exists (
      select 1 from public.shelves
      where shelves.id = shelf_id and shelves.user_id = auth.uid()
    )
  );

-- Reading entries: readable by everyone (powers profile stats/rhythm
-- charts and friend activity), writable only by the owner
create policy "Reading entries are publicly readable" on public.reading_entries
  for select using (true);
create policy "Users manage their own reading entries" on public.reading_entries
  for insert with check (auth.uid() = user_id);
create policy "Users update their own reading entries" on public.reading_entries
  for update using (auth.uid() = user_id);
create policy "Users delete their own reading entries" on public.reading_entries
  for delete using (auth.uid() = user_id);

-- Reviews: publicly readable, writable only by the owner
create policy "Reviews are publicly readable" on public.reviews
  for select using (true);
create policy "Users manage their own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Users update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);
create policy "Users delete their own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

-- Follows: publicly readable (powers follower counts + activity feed),
-- writable only by the follower themselves
create policy "Follows are publicly readable" on public.follows
  for select using (true);
create policy "Users manage their own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users remove their own follows" on public.follows
  for delete using (auth.uid() = follower_id);
