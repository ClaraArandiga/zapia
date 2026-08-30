"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { LeadStatus } from "@/lib/types";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    redirect(`/admin/login?erro=${encodeURIComponent("E-mail ou senha inválidos")}`);
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await getSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function atualizarStatusLead(formData: FormData) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;

  const service = getSupabaseServiceClient();
  await service.from("leads").update({ status }).eq("id", leadId);

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
}
