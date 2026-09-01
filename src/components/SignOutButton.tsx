"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="text-sm text-paper-dim hover:text-paper transition"
    >
      Sign out
    </button>
  );
}
