# ZapIA: Landing Page + Funil de Vendas

Funil completo: landing page → formulário inicial (lead) → checkout R$47 (Mercado Pago) →
confirmação de pagamento → formulário de implantação (dados técnicos/sensíveis).

O motor do bot em si (webhook do WhatsApp respondendo com IA, painel admin) é a próxima etapa.
O schema do banco já está pronto para isso em `supabase/schema.sql`.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. Vá em **SQL Editor** → **New query**, cole o conteúdo de `supabase/schema.sql` e rode.
3. Vá em **Project Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha essa chave no frontend)

## 3. Configurar o Mercado Pago

1. Crie uma aplicação em https://www.mercadopago.com.br/developers/panel/app.
2. Copie o **Access Token de teste** para `MERCADOPAGO_ACCESS_TOKEN` (comece sempre pelo modo
   teste, com um usuário comprador de teste, antes de trocar para produção).
3. Em produção, configure a URL de notificação do webhook como
   `https://SEU-DOMINIO/api/webhooks/mercadopago` (o código já monta essa URL sozinho a partir de
   `NEXT_PUBLIC_SITE_URL`).
4. Opcional (recomendado em produção): copie a **Assinatura secreta (webhook secret)** do painel
   para `MERCADOPAGO_WEBHOOK_SECRET`, para validar que as notificações realmente vêm do Mercado
   Pago.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores obtidos acima:

```bash
cp .env.example .env.local
```

## 5. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 e percorra o funil: `/` → `/lead` → `/checkout` → (pagamento no
Mercado Pago) → `/obrigado` → `/onboarding`.

> Para testar o pagamento localmente, o Mercado Pago precisa alcançar seu webhook. Use uma
> ferramenta de túnel (ex: `ngrok http 3000`) e configure `NEXT_PUBLIC_SITE_URL` com a URL pública
> temporária durante o teste.

## 6. Deploy na Vercel

1. Suba este projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure as mesmas variáveis de `.env.local` em **Project Settings → Environment Variables**.
4. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio final antes de trocar o Mercado Pago para
   produção.

## Próxima etapa (fora do escopo desta entrega)

- `app/api/webhook/whatsapp`: receber mensagens do WhatsApp Cloud API (Meta for Developers) e
  responder usando a camada de IA já esboçada em `lib/ai/` (`AI_PROVIDER=anthropic` ou `openai`).
- Painel admin para cadastrar cada cliente (empresa) e gerar o prompt/base de conhecimento a
  partir das tabelas `clientes`, `empresa_config`, `produtos` e `faq`.
- Fluxo de cobrança recorrente (mensalidade) além da configuração inicial de R$47.
