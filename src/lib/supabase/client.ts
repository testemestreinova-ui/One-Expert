import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Usado em Client Components — cria uma instância por chamada (SSR-safe)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
