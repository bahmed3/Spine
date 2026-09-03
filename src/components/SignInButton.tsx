"use client";

import { createClient } from "@/lib/supabase/client";

export function SignInButton({ compact = false }: { compact?: boolean }) {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={signInWithGoogle}
      className={
        compact
          ? "font-sans text-sm font-medium text-paper-dim hover:text-paper transition"
          : "font-sans text-sm font-semibold px-5 py-2.5 rounded-lg bg-brass text-ink hover:opacity-90 transition"
      }
    >
      {compact ? "Sign in" : "Continue with Google"}
    </button>
  );
}
