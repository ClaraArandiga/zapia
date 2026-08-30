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
    produtosServicos: body.produtosServicos || null,
    faq: body.faq || null,
    formasPagamento: body.formasPagamento || null,
    politicaTrocaCancelamento: body.politicaTrocaCancelamento || null,
    quandoTransferirHumano: body.quandoTransferirHumano || null,
  });

  return NextResponse.json({ promptSistema });
}
