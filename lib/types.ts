export type StatusAgendamento = 'Confirmado' | 'Concluído' | 'Cancelado';

export type StatusSolicitacao = 'AguardandoAprovacao' | 'Aprovado' | 'Recusado';

export interface Solicitacao {
  id: string;
  cliente: string;
  whatsapp: string;
  servicos: string;
  totalServicos: number;
  barbeiro: string;
  data: string;
  horario: string;
  status: StatusSolicitacao;
  criadoEm: number;
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  duracao: string;
  preco: string;
  precoNumerico: number;
  ativo: boolean;
}

export interface Agendamento {
  id: string;
  cliente: string;
  whatsapp: string;
  servico: string;
  totalServicos: number;
  barbeiro: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
  confirmadoEm: number;
}

export interface Depoimento {
  nome: string;
  texto: string;
  rating: number;
}

export interface KPI {
  title: string;
  value: string;
  trend: string;
}

export interface DadoReceita {
  name: string;
  total: number;
}

export interface DadoServico {
  name: string;
  value: number;
}
