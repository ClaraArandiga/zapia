import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase com sessão via cookies, para uso em Server Components,
 * layouts e Server Actions do painel admin (/admin). Diferente de
 * getSupabaseServiceClient, este respeita a sessão do usuário autenticado
 * (Supabase Auth), não a service_role key.
 */
export async function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component (somente leitura de cookies).
          // A sessão continua sendo atualizada normalmente pelas Server Actions
          // de login/logout, que rodam num contexto onde cookies são graváveis.
        }
      },
    },
  });
}

/**
 * Checa se um e-mail pertence à lista de administradoras (ADMIN_EMAILS,
 * separados por vírgula). Como clientes agora também têm login no mesmo
 * projeto Supabase Auth (/painel), o painel admin não pode liberar acesso
 * só por existir uma sessão. Precisa ser especificamente uma admin.
 */
export function ehEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const permitidos = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return permitidos.includes(email.toLowerCase());
}
