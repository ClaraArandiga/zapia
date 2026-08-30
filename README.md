# ZapIA: Landing Page + Funil de Vendas

Funil completo: landing page → formulário inicial (lead) → checkout de assinatura R$47/mês
(Mercado Pago) → confirmação de pagamento → formulário de implantação (dados técnicos/sensíveis).
Inclui o painel admin (`/admin`) para acompanhar os leads, e o motor do chatbot em si: um webhook
do WhatsApp (`app/api/webhooks/whatsapp`) que responde os clientes finais usando IA (Gemini),
multi-cliente (cada empresa conectada fica identificada pelo próprio número de WhatsApp).

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

## 9. Configurar e testar o chatbot do WhatsApp

O bot é multi-cliente: um único Meta App (o seu, como "provedor de tecnologia") recebe as
mensagens de todos os números conectados, identificando de qual empresa é cada mensagem pelo
`phone_number_id` (salvo por cliente na tabela `clientes`). Para desenvolver, use o **número de
teste gratuito** que a Meta dá em todo App novo.

### 9.1. Criar o Meta App e pegar o número de teste

1. Acesse **https://developers.facebook.com/apps** → **Criar app** → tipo "Negócios" (Business).
2. Dentro do App, adicione o produto **WhatsApp**.
3. Na página do produto WhatsApp → **Introdução/API Setup**, você já tem um número de teste
   pronto, com **Phone Number ID** e um **Access Token temporário** (válido por 24h, dá pra gerar
   de novo quantas vezes precisar durante os testes).
4. Nessa mesma tela, cadastre até 5 números de WhatsApp seus/de confiança em **To** para poder
   mandar mensagens de teste para o número da Meta.

### 9.2. Configurar o webhook

1. Escolha um valor qualquer para `WHATSAPP_VERIFY_TOKEN` (uma senha simples, você inventa).
2. No App, vá em **WhatsApp → Configuration → Webhook** → **Edit**.
3. **Callback URL**: `https://SEU-DOMINIO/api/webhooks/whatsapp`
4. **Verify token**: o mesmo valor que você colocou em `WHATSAPP_VERIFY_TOKEN`.
5. Clique em **Verify and save** (o código já responde esse handshake automaticamente).
6. Em **Webhook fields**, clique em **Manage** e assine o campo **messages**.
7. Opcional (recomendado em produção): copie o **App Secret** do App (Configurações → Básico) para
   `WHATSAPP_APP_SECRET`, para validar que as notificações vêm mesmo da Meta.

### 9.3. Configurar o Gemini

1. Acesse **https://aistudio.google.com/apikey** (login com conta Google, sem cartão).
2. Crie uma chave e copie para `GEMINI_API_KEY`.

### 9.4. Criar um cliente de teste

O painel admin ainda não cadastra `clientes` (só `leads`). Por enquanto, crie um direto no
**SQL Editor** do Supabase, usando o Phone Number ID e o Access Token do passo 9.1:

```sql
with novo_cliente as (
  insert into clientes (nome_empresa, segmento, whatsapp_phone_number_id, whatsapp_access_token)
  values ('Minha Empresa Teste', 'loja de roupas', 'SEU_PHONE_NUMBER_ID', 'SEU_ACCESS_TOKEN')
  returning id
)
insert into produtos (cliente_id, nome, descricao, preco)
select id, 'Camiseta básica', 'Algodão, várias cores', 59.90 from novo_cliente;
```

Repita um `insert into faq (cliente_id, pergunta, resposta) values (...)` se quiser testar
perguntas frequentes.

### 9.5. Testar

1. `npm run dev` local + túnel (`ngrok http 3000`), com o Callback URL do passo 9.2 apontando para
   a URL do túnel (você pode reconfigurar depois para o domínio da Vercel).
2. Mande uma mensagem de um dos números verificados de teste para o número de teste do WhatsApp.
3. A IA deve responder usando as informações do cliente cadastrado. Confira as tabelas `conversas`
   e `mensagens` no Supabase para ver o histórico salvo.
4. Peça para "falar com uma pessoa" numa mensagem, e confirme que `conversas.status` muda para
   `transferida_humano` (o bot para de responder automaticamente a partir daí).

## 10. Conectar clientes reais (Embedded Signup)

Isso substitui o passo 9.4 (criar cliente via SQL): o próprio cliente conecta o WhatsApp dele
clicando num botão em `/onboarding`, sem precisar criar conta de desenvolvedor nem compartilhar
senha. Funciona em modo de desenvolvimento com **testers** do seu App (sem esperar aprovação da
Meta); para abrir para qualquer cliente, a Meta exige depois uma revisão do App (**App Review**).

### 10.1. Configurar no Meta

1. No mesmo App do passo 9.1, adicione o produto **Facebook Login for Business**.
2. Vá em **WhatsApp Manager → Embedded Signup** (dentro do Business Manager) e crie uma
   configuração. Isso gera um **Configuration ID**.
3. Pegue o **App ID** em **Configurações do App → Básico**.
4. Para testar antes do App Review: em **Funções do App → Testadores**, adicione seu próprio
   usuário (ou de quem for testar) como tester.

### 10.2. Variáveis de ambiente

```
NEXT_PUBLIC_WHATSAPP_APP_ID=<App ID>
NEXT_PUBLIC_WHATSAPP_CONFIG_ID=<Configuration ID do Embedded Signup>
```

`WHATSAPP_APP_SECRET` (já configurado no passo 9.2) é reaproveitado para trocar o código de
autorização por um token de acesso.

### 10.3. Testar

1. Acesse `/onboarding?lead=<id de um lead pago>` logada como tester no navegador.
2. Clique em **Conectar WhatsApp Business**, escolha/crie o WABA do teste no popup da Meta.
3. Confirme que apareceu "WhatsApp conectado" e que uma linha nova (ou atualizada) apareceu em
   `clientes`, com `whatsapp_phone_number_id` e `whatsapp_access_token` preenchidos.
4. Preencha o resto do formulário e envie — isso monta o prompt do bot automaticamente
   (`empresa_config.prompt_sistema`) a partir das respostas.
5. Mande uma mensagem de teste pro número conectado, igual no passo 9.5, e confirme que a IA
   responde usando as informações reais que você preencheu no formulário.

### 10.4. Abrindo para o público

Enquanto o App não passa pelo **App Review** da Meta, só testers conseguem completar o Embedded
Signup. Quando estiver pronta para clientes reais fora dessa lista, submeta o App para revisão
pedindo as permissões `whatsapp_business_management` e `whatsapp_business_messaging` (a Meta pode
pedir um vídeo curto mostrando o fluxo).

## Próxima etapa (fora do escopo desta entrega)

- Suporte a mensagens de mídia (áudio, imagem) no webhook, hoje só texto.
- Renovação automática do token de acesso do WhatsApp (o token trocado no Embedded Signup tem
  validade limitada).
- Expandir o painel admin para gerenciar `clientes`, `produtos` e `faq` diretamente pela interface
  (hoje o prompt vem do texto livre do formulário de implantação).
- Notificação de verdade (WhatsApp/e-mail) para a equipe humana quando uma conversa é transferida.
- App Review da Meta, para conectar clientes reais além da lista de testers.
