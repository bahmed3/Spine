import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";

// Global nav bar rendered on every page via the root layout. This is
// what makes it possible to get back to the homepage from anywhere -
// previously /discover had no way out at all.
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-line">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-[18px] h-[22px] rounded-tl-sm rounded-bl-[4px] rounded-tr-[4px] rounded-br-[4px] bg-gradient-to-b from-oxblood to-oxblood-light" />
        <span className="font-serif font-semibold text-lg">spine</span>
      </Link>
      <nav className="flex items-center gap-5">
        <Link
          href="/discover"
          className="text-sm text-paper-dim hover:text-paper transition"
        >
          Discover
        </Link>
        {user && (
          <Link
            href="/shelves"
            className="text-sm text-paper-dim hover:text-paper transition"
          >
            Shelves
          </Link>
        )}
        {user && (
          <Link
            href="/profile"
            className="text-sm text-paper-dim hover:text-paper transition"
          >
            Profile
          </Link>
        )}
        {user ? <SignOutButton /> : <SignInButton compact />}
      </nav>
    </header>
  );
}
