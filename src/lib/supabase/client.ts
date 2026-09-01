import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components. Reads the public env vars — safe to expose
// in the browser bundle, since Supabase's row-level security (not this
// key) is what actually protects data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
