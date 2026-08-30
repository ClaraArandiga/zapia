const itens = [
  {
    icone: "🛡️",
    titulo: "Garantia de 7 dias",
    texto: "Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.",
  },
  {
    icone: "🔒",
    titulo: "Pagamento 100% seguro",
    texto: "Processado pelo Mercado Pago, a maior plataforma de pagamentos da América Latina.",
  },
];

export function ConfiancaBadges() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {itens.map((item) => (
        <div
          key={item.titulo}
          className="group flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-400/60 hover:bg-brand-500/5"
        >
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
            <span className="absolute inset-0 rounded-full bg-brand-500/15" />
            <span className="relative text-3xl">{item.icone}</span>
          </div>
          <h3 className="mt-5 text-xl font-bold text-white">{item.titulo}</h3>
          <p className="mt-2 text-sm text-white/60">{item.texto}</p>
        </div>
      ))}
    </div>
  );
}
