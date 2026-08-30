export type LeadStatus = "novo" | "pago" | "implantado" | "cancelado";

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  empresa: string;
  segmento: string;
  whatsapp_contato: string;
  email: string;
  o_que_vende: string | null;
  objetivo_bot: string | null;
  duvidas_frequentes: string | null;
  tom_de_voz: string | null;
  horario_atendimento: string | null;
  instagram_ou_site: string | null;
  status: LeadStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
}

export interface Assinatura {
  id: string;
  created_at: string;
  lead_id: string | null;
  mp_preapproval_id: string;
  status: string;
  valor: number | null;
}

export interface NovoLeadInput {
  nome: string;
  empresa: string;
  segmento: string;
  whatsapp_contato: string;
  email: string;
  o_que_vende?: string;
  objetivo_bot?: string;
  duvidas_frequentes?: string;
  tom_de_voz?: string;
  horario_atendimento?: string;
  instagram_ou_site?: string;
}

export interface OnboardingInput {
  lead_id: string;
  whatsapp_business_number: string;
  autorizou_meta: boolean;
  produtos_servicos?: string;
  faq?: string;
  formas_pagamento?: string;
  politica_troca_cancelamento?: string;
  endereco_localizacao?: string;
  como_funciona_atendimento?: string;
  quando_transferir_humano?: string;
  contato_equipe_humana?: string;
  observacoes?: string;
}
