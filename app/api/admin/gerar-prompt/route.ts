import { NextResponse } from "next/server";
import { getSupabaseAuthClient, ehEmailAdmin } from "@/lib/supabase-server";
import { montarPromptSistema } from "@/lib/ai";

export async function POST(request: Request) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!ehEmailAdmin(user?.email)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const promptSistema = montarPromptSistema({
    nomeEmpresa: body.nomeEmpresa ?? "",
    segmento: body.segmento ?? "",
    tomDeVoz: body.tomDeVoz || null,
    horarioAtendimento: body.horarioAtendimento || null,
    enderecoLocalizacao: body.enderecoLocalizacao || null,
    produtosServicos: body.produtosServicos || null,
    diferenciais: body.diferenciais || null,
    faq: body.faq || null,
    formasPagamento: body.formasPagamento || null,
    politicaTrocaCancelamento: body.politicaTrocaCancelamento || null,
    comoFuncionaAtendimento: body.comoFuncionaAtendimento || null,
    quandoTransferirHumano: body.quandoTransferirHumano || null,
    contatoEquipeHumana: body.contatoEquipeHumana || null,
    restricoes: body.restricoes || null,
    observacoes: body.observacoes || null,
  });

  return NextResponse.json({ promptSistema });
}
