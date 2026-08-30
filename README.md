# ZapIA: Landing Page + Funil de Vendas

Funil completo: landing page → formulário inicial (lead) → checkout de assinatura R$47/mês
(Mercado Pago) → confirmação de pagamento → formulário de implantação (dados técnicos/sensíveis).
Inclui também o painel admin (`/admin`) para acompanhar os leads sem precisar abrir o Supabase.

O motor do bot em si (webhook do WhatsApp respondendo com IA) é a próxima etapa. O schema do banco
já está pronto para isso em `supabase/schema.sql`.

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
3. **Importante (diferente de uma Preference):** como o checkout agora cria uma **assinatura**
   (Preapproval), a URL de notificação não é enviada por requisição. Precisa ser configurada uma
   vez no painel da aplicação, em **Webhooks**, apontando para
   `https://SEU-DOMINIO/api/webhooks/mercadopago`, assinando os tópicos **Assinaturas**
   (`subscription_preapproval`) e **Pagamentos** (`payment`).
4. Opcional (recomendado em produção): copie a **Assinatura secreta (webhook secret)** do painel
   para `MERCADOPAGO_WEBHOOK_SECRET`, para validar que as notificações realmente vêm do Mercado
   Pago.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores obtidos acima:

```bash
cp .env.example .env.local
```

## 5. Configurar o painel admin

O painel (`/admin`) usa o mesmo Supabase, autenticando com **Supabase Auth** (e-mail/senha).

1. No painel do Supabase, vá em **Authentication → Users → Add user**.
2. Crie seu usuário com e-mail e senha (marque "Auto Confirm User" para não depender de e-mail de
   confirmação).
3. Acesse `/admin` no site e entre com esse e-mail/senha.

## 6. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 e percorra o funil: `/` → `/lead` → `/checkout` → (pagamento no
Mercado Pago) → `/obrigado` → `/onboarding`.

> Para testar o pagamento localmente, o Mercado Pago precisa alcançar seu webhook. Use uma
> ferramenta de túnel (ex: `ngrok http 3000`) e configure `NEXT_PUBLIC_SITE_URL` com a URL pública
> temporária durante o teste.

## 7. Deploy na Vercel

1. Suba este projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure as mesmas variáveis de `.env.local` em **Project Settings → Environment Variables**.
4. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio final.

## 8. Checklist para ir para produção no Mercado Pago

O código funciona igual com credenciais de teste ou de produção, só a variável de ambiente muda.
Quando estiver pronta para cobrar de verdade:

1. Complete a verificação de vendedora na sua conta Mercado Pago (CPF/CNPJ, identidade, conta
   bancária), se ainda não fez.
2. No painel de developers, pegue o **Access Token de produção** (começa com `APP_USR-...`) e
   troque `MERCADOPAGO_ACCESS_TOKEN` na Vercel.
3. Reconfigure o webhook (item 3 acima) na aplicação, apontando para o domínio final, e configure
   `MERCADOPAGO_WEBHOOK_SECRET` de produção.
4. Faça um **Redeploy** na Vercel para aplicar as novas variáveis.
5. Faça uma assinatura de teste real (você mesma, com um cartão de verdade) e cancele logo em
   seguida para confirmar que todo o fluxo funciona antes de anunciar publicamente.

## Próxima etapa (fora do escopo desta entrega)

- `app/api/webhook/whatsapp`: receber mensagens do WhatsApp Cloud API (Meta for Developers) de
  cada cliente e responder usando a camada de IA já esboçada em `lib/ai/`
  (`AI_PROVIDER=anthropic` ou `openai`). Depende da conta Meta for Developers de cada cliente
  final, não é algo configurado uma única vez.
- Expandir o painel admin para gerenciar `clientes`, `produtos` e `faq` (tabelas do bot) quando o
  webhook acima existir.
