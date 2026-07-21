'use client';

import { useState, useEffect } from 'react';
import { getAgendamentos, getHistoricoTurnos, encerrarTurno, RegistroTurno } from '@/lib/store';
import type { Agendamento } from '@/lib/types';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Award } from 'lucide-react';

function EntradaManual({ onSalvar }: { onSalvar: (valor: number, descricao: string) => void }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Serviço');
  const [salvo, setSalvo] = useState(false);

  const handleSalvar = () => {
    const v = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim() || isNaN(v) || v <= 0) return;
    onSalvar(v, descricao);
    setDescricao('');
    setValor('');
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div className="space-y-4">
      <input
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        placeholder="Descrição da entrada"
        className="w-full bg-transparent border-b border-white/10 focus:border-gold-500 
        py-3 text-white text-sm outline-none placeholder:text-[#444] transition-colors"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="R$ 0,00"
          className="w-full bg-transparent border-b border-white/10 focus:border-gold-500 
          py-3 text-white text-sm outline-none placeholder:text-[#444] transition-colors"
        />
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="w-full bg-[#0A0A0A] border-b border-white/10 focus:border-gold-500 
          py-3 text-[#888] text-sm outline-none transition-colors"
        >
          <option value="Serviço">Serviço</option>
          <option value="Produto">Produto</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
      <button
        onClick={handleSalvar}
        className="w-full bg-gold-500 text-black font-bold text-[10px] uppercase 
        tracking-widest py-3 min-h-[44px] hover:bg-gold-400 transition-colors touch-manipulation"
      >
        {salvo ? '✓ Registrado!' : 'Registrar Entrada'}
      </button>
    </div>
  );
}

function HistoricoEntradas() {
  const [entradas, setEntradas] = useState<Array<{
    id: number;
    valor: number;
    descricao: string;
    data: string;
  }>>([]);

  useEffect(() => {
    const carregar = () => {
      try {
        const salvas = JSON.parse(localStorage.getItem('mrduque_entradas') || '[]');
        setEntradas([...salvas].reverse());
      } catch {
        setEntradas([]);
      }
    };
    carregar();
    const interval = setInterval(carregar, 5000);
    return () => clearInterval(interval);
  }, []);

  const remover = (id: number) => {
    const salvas = JSON.parse(localStorage.getItem('mrduque_entradas') || '[]');
    const novas = salvas.filter((e: { id: number }) => e.id !== id);
    localStorage.setItem('mrduque_entradas', JSON.stringify(novas));
    setEntradas([...novas].reverse());
  };

  if (entradas.length === 0) return null;

  const total = entradas.reduce((acc: number, e: {valor: number}) => acc + e.valor, 0);

  return (
    <div className="bg-[#0F0F0F] border border-[#222]">
      <div className="p-4 md:p-6 border-b border-[#222] flex justify-between items-center">
        <h3 className="font-serif text-xl text-white">Entradas Manuais</h3>
        <span className="text-gold-500 font-serif text-lg">
          Total: R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>
      <div className="divide-y divide-[#222]">
        {entradas.slice(0, 10).map(e => (
          <div key={e.id} className="px-4 md:px-6 py-4 flex items-center justify-between group">
            <div>
              <p className="text-white text-sm">{e.descricao}</p>
              <p className="text-[10px] text-[#555] font-mono mt-0.5">
                {new Date(e.data).toLocaleDateString('pt-BR')} às{' '}
                {new Date(e.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gold-500 font-serif">
                R$ {e.valor.toFixed(2).replace('.', ',')}
              </span>
              <button
                onClick={() => remover(e.id)}
                className="text-[#333] hover:text-red-500 transition-colors text-[10px] 
                uppercase tracking-widest min-h-[44px] touch-manipulation opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [confirmandoEncerramento, setConfirmandoEncerramento] = useState(false);
  const [historico, setHistorico] = useState<RegistroTurno[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgendamentos(getAgendamentos());
    setHistorico(getHistoricoTurnos());
    const interval = setInterval(() => {
      setAgendamentos(getAgendamentos());
      setHistorico(getHistoricoTurnos());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const concluidos = agendamentos.filter(a => a.status === 'Concluído');

  const receitaHoje = concluidos
    .filter(a => a.data === 'Hoje')
    .reduce((acc, a) => acc + (a.totalServicos || 0), 0);

  const receitaTotal = concluidos
    .reduce((acc, a) => acc + (a.totalServicos || 0), 0);

  const ticketMedio = concluidos.length > 0
    ? receitaTotal / concluidos.length
    : 0;

  const receitaPorServico = concluidos.reduce((acc, a) => {
    const nome = a.servico.split(',')[0].trim();
    acc[nome] = (acc[nome] || 0) + (a.totalServicos || 0);
    return acc;
  }, {} as Record<string, number>);

  const dadosServicos = Object.entries(receitaPorServico)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const servicoTop = dadosServicos[0] || null;

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dadosSemana = diasSemana.map(dia => ({ name: dia, receita: 0 }));
  receitaHoje > 0 && (dadosSemana[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1].receita = receitaHoje);

  const salvarEntrada = (valor: number, descricao: string) => {
    try {
      const salvas = JSON.parse(localStorage.getItem('mrduque_entradas') || '[]');
      salvas.push({ id: Date.now(), valor, descricao, data: new Date().toISOString() });
      localStorage.setItem('mrduque_entradas', JSON.stringify(salvas));
    } catch {}
  };

  const kpis = [
    { title: 'Receita Hoje', value: `R$ ${receitaHoje.toFixed(2).replace('.', ',')}`, icon: DollarSign },
    { title: 'Receita Total', value: `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`, icon: TrendingUp },
    { title: 'Ticket Médio', value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`, icon: Award },
    { title: 'Atendimentos', value: String(concluidos.length), icon: Calendar },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8 pb-12">

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500 font-bold">
            Controle Financeiro
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-tight">
            Financeiro
          </h1>
        </div>
        
        <button
          onClick={() => setConfirmandoEncerramento(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-500/40 
          text-red-400 text-[10px] uppercase tracking-widest font-bold 
          hover:bg-red-500/10 transition-colors touch-manipulation min-h-[44px]"
        >
          <span>⏹</span> Encerrar Turno
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-[#0F0F0F] border border-[#222] p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-[#666]">{kpi.title}</p>
                <Icon className="w-4 h-4 text-gold-500/50" />
              </div>
              <p className="font-serif text-xl md:text-2xl lg:text-3xl text-white">{kpi.value}</p>
              <div className="h-px w-full bg-gold-500/20" />
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-[#0F0F0F] border border-[#222] p-4 md:p-6">
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-8">
            Receita da Semana
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosSemana} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: 0 }}
                  itemStyle={{ color: '#C5A059' }}
                  formatter={(v) => [`R$ ${v}`, 'Receita']}
                />
                <Area type="monotone" dataKey="receita" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#gradFin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#222] p-4 md:p-6">
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-8">
            Top Serviços
          </p>
          {dadosServicos.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-[#333] text-[11px] uppercase tracking-widest text-center">
                Conclua atendimentos<br />para ver dados
              </p>
            </div>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosServicos} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} width={60} />
                  <Tooltip
                    cursor={{ fill: '#1a1a1a' }}
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: 0 }}
                    itemStyle={{ color: '#C5A059' }}
                    formatter={(v) => [`R$ ${v}`, 'Receita']}
                  />
                  <Bar dataKey="value" barSize={16}>
                    {dadosServicos.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? '#C5A059' : '#2a2a2a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Destaque + Entrada manual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-[#0F0F0F] border border-[#222] p-4 md:p-6">
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-6">
            Destaque do Período
          </p>
          {servicoTop ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-2xl text-white mb-1">{servicoTop.name}</p>
                <p className="text-[11px] text-[#555] uppercase tracking-widest">
                  Serviço mais rentável
                </p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl text-gold-500">
                  R$ {servicoTop.value.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-[#555]">receita gerada</p>
              </div>
            </div>
          ) : (
            <p className="text-[#333] text-[11px] uppercase tracking-widest">
              Sem dados ainda
            </p>
          )}
        </div>

        <div className="bg-[#0F0F0F] border border-[#222] p-4 md:p-6">
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-6">
            Registrar Receita Manual
          </p>
          <EntradaManual onSalvar={salvarEntrada} />
        </div>

      </div>

      {/* Histórico Entradas*/}
      <HistoricoEntradas />

      {/* Histórico Turnos */}
      {historico.length > 0 && (
        <div className="bg-[#0F0F0F] border border-[#222]">
          <div className="p-4 md:p-6 border-b border-[#222]">
            <h3 className="font-serif text-xl text-white">Histórico de Turnos</h3>
          </div>
          <div className="divide-y divide-[#222]">
            {historico.slice(0, 10).map(t => (
              <div key={t.id} className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Data</p>
                  <p className="text-white text-sm font-bold">{t.data}</p>
                  <p className="text-[10px] text-[#444] capitalize">{t.diaSemana}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Receita</p>
                  <p className="text-gold-500 font-serif text-lg">
                    R$ {((t.receitaServicos ?? (t as any).receita ?? 0) + (t.receitaManual ?? 0)).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Atendimentos</p>
                  <p className="text-white text-sm">{t.totalAtendimentos ?? (t as any).atendimentos ?? 0} clientes</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Encerrado às</p>
                  <p className="text-white text-sm font-mono">{t.encerradoEm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Encerramento */}
      {confirmandoEncerramento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#222] p-6 md:p-8 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            
            <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-3">
              Atenção
            </p>
            <h3 className="font-serif text-2xl text-white mb-4">Encerrar Turno?</h3>
            
            <div className="bg-[#1a1a1a] border border-[#222] p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Receita de serviços</span>
                <span className="text-white">R$ {receitaHoje.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Atendimentos concluídos</span>
                <span className="text-white">{concluidos.filter(a => a.data === 'Hoje').length}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#555] mb-6">
              A receita do dia será zerada e salva no histórico. Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmandoEncerramento(false)}
                className="flex-1 border border-[#222] text-[#888] py-3 text-[10px] min-h-[44px]
                uppercase tracking-widest hover:text-white hover:border-[#444] transition-colors touch-manipulation"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const entradasManuais = JSON.parse(localStorage.getItem('mrduque_entradas') || '[]');
                  const totalManual = entradasManuais.reduce((acc: number, e: {valor: number}) => acc + e.valor, 0);
                  encerrarTurno(receitaHoje, totalManual, concluidos.filter(a => a.data === 'Hoje').length);
                  setConfirmandoEncerramento(false);
                  setAgendamentos(getAgendamentos());
                  setHistorico(getHistoricoTurnos());
                }}
                className="flex-1 bg-red-500 text-white font-bold py-3 text-[10px] min-h-[44px]
                uppercase tracking-widest hover:bg-red-600 transition-colors touch-manipulation"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}