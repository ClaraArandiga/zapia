import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase para uso em Client Components (formulários interativos
 * do painel, como recuperação de senha). Usa a anon key.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(url, anonKey);
}
