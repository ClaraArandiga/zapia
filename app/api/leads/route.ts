import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";

const novoLeadSchema = z.object({
  nome: z.string().min(2),
  empresa: z.string().min(2),
  segmento: z.string().min(2),
  whatsapp_contato: z.string().min(8),
  email: z.string().email("E-mail inválido"),
  o_que_vende: z.string().optional(),
  objetivo_bot: z.string().optional(),
  duvidas_frequentes: z.string().optional(),
  tom_de_voz: z.string().optional(),
  horario_atendimento: z.string().optional(),
  instagram_ou_site: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = novoLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
