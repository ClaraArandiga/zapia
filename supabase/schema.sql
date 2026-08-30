-- Schema do "Atendente de IA no WhatsApp"
-- Rode este arquivo no SQL Editor do seu projeto Supabase (Project > SQL Editor > New query).
-- Todas as tabelas ficam protegidas por RLS e só são acessíveis via service_role (backend),
-- nunca diretamente pelo browser.

create extension if not exists "pgcrypto";

-- =========================================================
-- FUNIL DE VENDAS (usado agora)
-- =========================================================

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- formulário inicial
  nome text not null,
  empresa text not null,
  segmento text not null,
  whatsapp_contato text not null,
  email text,
  o_que_vende text,
  objetivo_bot text,               -- vender / agendar / tirar dúvidas / captar leads
  duvidas_frequentes text,
  tom_de_voz text,
  horario_atendimento text,
  instagram_ou_site text,

  -- estado do funil
  status text not null default 'novo' check (status in ('novo', 'pago', 'implantado', 'cancelado')),

  -- referência ao checkout do Mercado Pago
  mp_preference_id text,
  mp_payment_id text
);

create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete set null,
  mp_payment_id text not null unique,
  mp_preference_id text,
  status text not null,            -- approved / pending / rejected / etc (status bruto do Mercado Pago)
  valor numeric(10,2),
  raw_payload jsonb                -- payload completo da notificação, para auditoria/depuração
);

create table if not exists assinaturas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete set null,
  mp_preapproval_id text not null unique,
  status text not null,            -- pending / authorized / paused / cancelled (status bruto do Mercado Pago)
  valor numeric(10,2),
  raw_payload jsonb                -- payload completo da notificação, para auditoria/depuração
);

create table if not exists onboarding_respostas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references leads(id) on delete cascade,

  whatsapp_business_number text not null,
  autorizou_meta boolean not null default false,

  produtos_servicos text,          -- lista livre de produtos/serviços + preços
  faq text,                        -- perguntas e respostas frequentes
  formas_pagamento text,
  politica_troca_cancelamento text,
  endereco_localizacao text,
  como_funciona_atendimento text,  -- fluxo de venda/agendamento
  quando_transferir_humano text,
  contato_equipe_humana text,

  observacoes text
);

-- =========================================================
-- OPERAÇÃO DO BOT (próxima etapa — schema já pronto)
-- =========================================================

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete set null,

  nome_empresa text not null,
  segmento text,
  whatsapp_phone_number_id text,   -- Phone Number ID (Meta)
  whatsapp_business_account_id text,
  whatsapp_access_token text,      -- idealmente migrar para um cofre de segredos (ex: Supabase Vault)
  ativo boolean not null default true
);

create table if not exists empresa_config (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  tom_de_voz text,
  horario_atendimento text,
  endereco_localizacao text,
  formas_pagamento text,
  politica_troca_cancelamento text,
  quando_transferir_humano text,
  contato_equipe_humana text,
  prompt_sistema text              -- prompt final gerado a partir dessas informações
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(10,2),
  ativo boolean not null default true
);

create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  pergunta text not null,
  resposta text not null
);

create table if not exists conversas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  numero_cliente_final text not null,   -- número de WhatsApp de quem está conversando com o bot
  status text not null default 'ativa' check (status in ('ativa', 'transferida_humano', 'encerrada')),
  ultima_mensagem_em timestamptz not null default now()
);

create table if not exists mensagens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversa_id uuid not null references conversas(id) on delete cascade,
  remetente text not null check (remetente in ('cliente_final', 'bot', 'humano')),
  texto text not null,
  whatsapp_message_id text
);

-- =========================================================
-- RLS: nenhuma tabela é acessível diretamente do browser.
-- Todo acesso passa pelas rotas /api/* usando a service_role key.
-- =========================================================

alter table leads enable row level security;
alter table pagamentos enable row level security;
alter table assinaturas enable row level security;
alter table onboarding_respostas enable row level security;
alter table clientes enable row level security;
alter table empresa_config enable row level security;
alter table produtos enable row level security;
alter table faq enable row level security;
alter table conversas enable row level security;
alter table mensagens enable row level security;

-- Nenhuma policy é criada de propósito: sem policy = sem acesso via chave anônima.
-- A service_role key ignora RLS por padrão (uso exclusivo no backend/servidor).
