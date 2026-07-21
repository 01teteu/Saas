import { Servico, Agendamento, Depoimento, DadoReceita, DadoServico } from './types';
export const servicos: Servico[] = [
  { id: 1, nome: 'Corte Clássico', descricao: 'Corte tradicional', duracao: '45 min', preco: 'R$ 60', precoNumerico: 60, ativo: true },
  { id: 2, nome: 'Barba Completa', descricao: 'Alinhamento', duracao: '30 min', preco: 'R$ 45', precoNumerico: 45, ativo: true },
  { id: 3, nome: 'Degradê (Fade)', descricao: 'Corte moderno', duracao: '45 min', preco: 'R$ 70', precoNumerico: 70, ativo: true },
  { id: 4, nome: 'Tratamento Capilar', descricao: 'Hidratação profunda', duracao: '20 min', preco: 'R$ 50', precoNumerico: 50, ativo: true },
  { id: 5, nome: 'Sobrancelha', descricao: 'Design', duracao: '15 min', preco: 'R$ 25', precoNumerico: 25, ativo: true },
  { id: 6, nome: 'Ritual Mr. Duque', descricao: 'Premium', duracao: '90 min', preco: 'R$ 140', precoNumerico: 140, ativo: false },
];
export const agendamentos: Agendamento[] = [
  { id: '1024', cliente: 'Rafael Torres', whatsapp: '(11) 98765-4321', servico: 'Corte Clássico', totalServicos: 60, barbeiro: 'Marcos', data: 'Hoje', horario: '14:00', status: 'Confirmado', confirmadoEm: Date.now() },
  { id: '1025', cliente: 'Carlos Silva', whatsapp: '(11) 91234-5678', servico: 'Barba Completa', totalServicos: 45, barbeiro: 'Tiago', data: 'Hoje', horario: '15:30', status: 'Concluído', confirmadoEm: Date.now() },
  { id: '1027', cliente: 'Marcel Souza', whatsapp: '(11) 95544-3322', servico: 'Ritual Mr. Duque', totalServicos: 140, barbeiro: 'Marcos', data: 'Amanhã', horario: '10:00', status: 'Confirmado', confirmadoEm: Date.now() },
];
export const depoimentos: Depoimento[] = [
  { nome: 'Carlos', texto: 'Melhor atendimento.', rating: 5 },
];
export const dadosReceita: DadoReceita[] = [
  { name: 'Seg', total: 1200 },
  { name: 'Ter', total: 1800 },
];
export const dadosServicosChart: DadoServico[] = [
  { name: 'Corte', value: 45 },
];
export const barbeiros = ['Marcos', 'Tiago', 'Lucas'];
export const galeriaUrls = [1, 2, 3].map((i) => `https://picsum.photos/seed/barbercut${i}/600/800`);
