import { Agendamento, Servico, Solicitacao, StatusSolicitacao } from './types';
import { agendamentos as agendamentosIniciais, servicos as servicosIniciais } from './data';

const KEYS = {
  agendamentos: 'lumina_agendamentos',
  servicos: 'lumina_servicos',
  solicitacoes: 'lumina_solicitacoes',
  limiteDiario: 'lumina_limite_diario',
  dataLimite: 'lumina_data_limite',
};

function inicializar<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  const salvo = localStorage.getItem(key);
  if (salvo) return JSON.parse(salvo);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function salvar<T>(key: string, dados: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(dados));
}

// SOLICITAÇÕES
export function getSolicitacoes(): Solicitacao[] {
  return inicializar(KEYS.solicitacoes, []);
}

export function salvarSolicitacoes(dados: Solicitacao[]): void {
  salvar(KEYS.solicitacoes, dados);
}

export function adicionarSolicitacao(nova: Solicitacao): void {
  const lista = getSolicitacoes();
  lista.push(nova);
  salvarSolicitacoes(lista);
}

export function aprovarSolicitacao(id: string): void {
  const solicitacoes = getSolicitacoes();
  const sol = solicitacoes.find(s => s.id === id);
  if (!sol) return;

  // Atualiza status da solicitação
  const novasSolicitacoes = solicitacoes.map(s =>
    s.id === id ? { ...s, status: 'Aprovado' as StatusSolicitacao } : s
  );
  salvarSolicitacoes(novasSolicitacoes);

  // Cria agendamento
  const novoAgendamento: Agendamento = {
    id: Date.now().toString(),
    cliente: sol.cliente,
    whatsapp: sol.whatsapp,
    servico: sol.servicos,
    totalServicos: sol.totalServicos,
    barbeiro: sol.barbeiro,
    data: sol.data,
    horario: sol.horario,
    status: 'Confirmado',
    confirmadoEm: Date.now(),
  };

  const agendamentos = getAgendamentos();
  agendamentos.push(novoAgendamento);
  salvarAgendamentos(agendamentos);
}

export function recusarSolicitacao(id: string): void {
  const lista = getSolicitacoes().map(s =>
    s.id === id ? { ...s, status: 'Recusado' as StatusSolicitacao } : s
  );
  salvarSolicitacoes(lista);
}

export function removerSolicitacao(id: string): void {
  salvarSolicitacoes(getSolicitacoes().filter(s => s.id !== id));
}

// AGENDAMENTOS
export function getAgendamentos(): Agendamento[] {
  return inicializar(KEYS.agendamentos, agendamentosIniciais);
}

export function salvarAgendamentos(dados: Agendamento[]): void {
  salvar(KEYS.agendamentos, dados);
}

export function adicionarAgendamento(novo: Agendamento): void {
  const lista = getAgendamentos();
  lista.push(novo);
  salvarAgendamentos(lista);
}

export function atualizarStatusAgendamento(id: string, status: Agendamento['status']): void {
  const lista = getAgendamentos().map(a => a.id === id ? { ...a, status } : a);
  salvarAgendamentos(lista);
}

export function removerAgendamento(id: string): void {
  const lista = getAgendamentos().filter(a => a.id !== id);
  salvarAgendamentos(lista);
}

// SERVICOS
export function getServicos(): Servico[] {
  return inicializar(KEYS.servicos, servicosIniciais);
}

export function salvarServicos(dados: Servico[]): void {
  salvar(KEYS.servicos, dados);
}

export const HORARIOS: Record<number, { abertura: string; fechamento: string } | null> = {
  0: null, // Domingo - FECHADO
  1: null, // Segunda - FECHADO
  2: { abertura: '08:00', fechamento: '19:00' }, // Terça
  3: { abertura: '08:00', fechamento: '19:00' }, // Quarta
  4: { abertura: '08:00', fechamento: '19:00' }, // Quinta
  5: { abertura: '08:00', fechamento: '19:00' }, // Sexta
  6: { abertura: '08:00', fechamento: '19:00' }, // Sábado
};

export function getLimiteDiario(): number | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.dataLimite);
  const hoje = new Date().toDateString();
  // Limite só vale para o dia atual
  if (data !== hoje) {
    localStorage.removeItem(KEYS.limiteDiario);
    localStorage.removeItem(KEYS.dataLimite);
    return null;
  }
  const limite = localStorage.getItem(KEYS.limiteDiario);
  return limite ? parseInt(limite) : null;
}

export function setLimiteDiario(limite: number): void {
  localStorage.setItem(KEYS.limiteDiario, String(limite));
  localStorage.setItem(KEYS.dataLimite, new Date().toDateString());
}

export function limparLimiteDiario(): void {
  localStorage.removeItem(KEYS.limiteDiario);
  localStorage.removeItem(KEYS.dataLimite);
}

export function getClientesAtendidosHoje(): number {
  const ags = getAgendamentos();
  return ags.filter(a => 
     a.data === 'Hoje' && 
     (a.status === 'Confirmado' || a.status === 'Concluído')
  ).length;
}

export function limiteBatido(): boolean {
  const limite = getLimiteDiario();
  if (limite === null) return false;
  return getClientesAtendidosHoje() >= limite;
}

// RESET (útil para demo)
export function resetarDados(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function getSolicitacaoPorId(id: string): Solicitacao | null {
  const lista = getSolicitacoes();
  return lista.find(s => s.id === id) || null;
}

export interface RegistroTurno {
  id: number;
  data: string;           // ex: "07/11/2026"
  diaSemana: string;      // ex: "Sexta-feira"
  receitaServicos: number;
  receitaManual: number;
  totalAtendimentos: number;
  encerradoEm: string;    // hora ex: "19:32"
}

const KEYS_TURNO = {
  historico: 'mrduque_historico_turnos',
};

export function getHistoricoTurnos(): RegistroTurno[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS_TURNO.historico) || '[]');
  } catch { return []; }
}

export function encerrarTurno(receitaServicos: number, receitaManual: number, totalAtendimentos: number): void {
  const agora = new Date();
  const registro: RegistroTurno = {
    id: Date.now(),
    data: agora.toLocaleDateString('pt-BR'),
    diaSemana: agora.toLocaleDateString('pt-BR', { weekday: 'long' }),
    receitaServicos,
    receitaManual,
    totalAtendimentos,
    encerradoEm: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };

  // Salva no historico
  const historico = getHistoricoTurnos();
  historico.unshift(registro);
  localStorage.setItem(KEYS_TURNO.historico, JSON.stringify(historico));

  // Zera agendamentos de hoje — move para a data atual e conclui os confirmados
  const dataAtual = agora.toLocaleDateString('pt-BR');
  const ags = getAgendamentos().map(a =>
    a.data === 'Hoje'
      ? { ...a, status: a.status === 'Confirmado' ? 'Concluído' as const : a.status, data: dataAtual }
      : a
  );
  salvarAgendamentos(ags);

  // Zera entradas manuais do dia
  localStorage.removeItem('mrduque_entradas');
}

export const limparNumero = (numero: string): string => {
  const apenasDigitos = numero.replace(/\D/g, '');
  if (apenasDigitos.startsWith('55') && apenasDigitos.length >= 12) {
    return apenasDigitos;
  }
  return `55${apenasDigitos}`;
};
