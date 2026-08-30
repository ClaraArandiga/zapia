"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAuthClient, ehEmailAdmin } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { LeadStatus } from "@/lib/types";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error || !ehEmailAdmin(email)) {
    await supabase.auth.signOut();
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
  await exigirSessaoAdmin();

  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;

  const service = getSupabaseServiceClient();
  await service.from("leads").update({ status }).eq("id", leadId);

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
}

async function exigirSessaoAdmin() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ehEmailAdmin(user.email)) {
    redirect("/admin/login");
  }
}

const campoOuNull = (formData: FormData, nome: string) => {
  const valor = String(formData.get(nome) ?? "").trim();
  return valor || null;
};

export async function salvarCliente(formData: FormData) {
  await exigirSessaoAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const service = getSupabaseServiceClient();

  const dadosCliente = {
    nome_empresa: String(formData.get("nome_empresa") ?? ""),
    segmento: campoOuNull(formData, "segmento"),
    whatsapp_phone_number_id: campoOuNull(formData, "whatsapp_phone_number_id"),
    whatsapp_business_account_id: campoOuNull(formData, "whatsapp_business_account_id"),
    whatsapp_access_token: campoOuNull(formData, "whatsapp_access_token"),
    ativo: formData.get("ativo") === "on",
  };

  let clienteId = id;

  if (id) {
    await service.from("clientes").update(dadosCliente).eq("id", id);
  } else {
    const { data: novoCliente, error } = await service
      .from("clientes")
      .insert(dadosCliente)
      .select("id")
      .single();

    if (error || !novoCliente) {
      redirect("/admin/clientes/novo?erro=" + encodeURIComponent("Não foi possível criar o cliente"));
    }

    clienteId = novoCliente.id;
  }

  await service.from("empresa_config").upsert(
    {
      cliente_id: clienteId,
      tom_de_voz: campoOuNull(formData, "tom_de_voz"),
      horario_atendimento: campoOuNull(formData, "horario_atendimento"),
      endereco_localizacao: campoOuNull(formData, "endereco_localizacao"),
      formas_pagamento: campoOuNull(formData, "formas_pagamento"),
      politica_troca_cancelamento: campoOuNull(formData, "politica_troca_cancelamento"),
      quando_transferir_humano: campoOuNull(formData, "quando_transferir_humano"),
      contato_equipe_humana: campoOuNull(formData, "contato_equipe_humana"),
      prompt_sistema: campoOuNull(formData, "prompt_sistema"),
    },
    { onConflict: "cliente_id" }
  );

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${clienteId}`);
  redirect(`/admin/clientes/${clienteId}`);
}

export async function excluirCliente(formData: FormData) {
  await exigirSessaoAdmin();

  const id = String(formData.get("id") ?? "");
  const service = getSupabaseServiceClient();
  await service.from("clientes").delete().eq("id", id);

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}
