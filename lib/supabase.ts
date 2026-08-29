import { createClient } from "@supabase/supabase-js";

/**
 * Client para uso exclusivo no servidor (rotas /api e Server Components).
 * Usa a service_role key, que ignora RLS. Nunca importe este arquivo em
 * código que roda no browser ("use client").
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
