"use client";

import { DollarSign, CalendarCheck, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useState, useEffect } from "react";
import { getAgendamentos, getServicos, getLimiteDiario, setLimiteDiario, limparLimiteDiario, getClientesAtendidosHoje } from "@/lib/store";
import { dadosReceita, dadosServicosChart } from "@/lib/data";
import { Agendamento, Servico } from "@/lib/types";


const ordenarAgendamentos = (lista: any[]) => {
  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const toMinutos = (horario: string) => {
    const [h, m] = horario.split(':').map(Number);
    return h * 60 + m;
  };
  const prioridade = (ag: any) => {
    if (ag.status === 'Concluído') return 9999;
    const minAg = toMinutos(ag.horario);
    if (ag.data === 'Hoje') {
      const diff = minAg - minutosAgora;
      return diff >= 0 ? diff : 1000 + Math.abs(diff);
    }
    return 5000 + toMinutos(ag.horario);
  };
  return [...lista].sort((a, b) => prioridade(a) - prioridade(b));
};

const isDiaFolga = (): boolean => {
  const dia = new Date().getDay();
  return dia === 0 || dia === 1; // Domingo ou Segunda
};

export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [limite, setLimite] = useState<number | null>(null);
  const [novoLimite, setNovoLimite] = useState('');
  const [isAbertaManual, setIsAbertaManual] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAbertaManual(localStorage.getItem('mrduque_aberta_manual') === 'true');
  }, []);

  const handleToggleStatus = () => {
    if (isDiaFolga()) return;
    const novoStatus = !isAbertaManual;
    setIsAbertaManual(novoStatus);
    localStorage.setItem('mrduque_aberta_manual', String(novoStatus));
    // Atualiza o event listener se necessário, ou recarrega
    window.dispatchEvent(new Event('status-changed'));
  };

  const carregarDados = () => {
    setAgendamentos(getAgendamentos());
    setServicos(getServicos());
    setLimite(getLimiteDiario());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSetLimite = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(novoLimite);
    if (!isNaN(val) && val > 0) {
      setLimiteDiario(val);
      setNovoLimite('');
      carregarDados();
    }
  };

  const handleRemoverLimite = () => {
    limparLimiteDiario();
    carregarDados();
  };

  const agendamentosHoje = agendamentos.filter(a => a.data === 'Hoje');
  const atendidosHoje = getClientesAtendidosHoje();
  
  const receitaHoje = agendamentosHoje
    .filter(a => a.status === 'Concluído')
    .reduce((sum, a) => {
      const s = servicos.find(s => s.nome === a.servico);
      return sum + (s?.precoNumerico || 0);
    }, 0);
  
  const receitaMes = agendamentos
    .filter(a => a.status === 'Concluído')
    .reduce((sum, a) => {
      const s = servicos.find(s => s.nome === a.servico);
      return sum + (s?.precoNumerico || 0);
    }, 0);
    
  const clientesUnicos = new Set(agendamentos.map(a => a.cliente)).size;

  const kpis = [
    { title: "Receita Hoje", value: `R$ ${receitaHoje}`, icon: DollarSign, trend: "+12%" },
    { title: "Agendamentos Hoje", value: agendamentosHoje.length.toString(), icon: CalendarCheck, trend: "0%" },
    { title: "Clientes Únicos", value: clientesUnicos.toString(), icon: Users, trend: "+2" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500 font-bold">Overview Diário</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight">Painel de Controle</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[#666] font-bold hidden sm:inline">Status Manual</span>
          <button
            onClick={() => !isDiaFolga() && handleToggleStatus()}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${isAbertaManual ? 'bg-gold-500' : 'bg-[#333]'} ${isDiaFolga() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isDiaFolga()}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${isAbertaManual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {isDiaFolga() && (
        <div className="bg-[#1a1a1a] border border-[#333] p-4 flex items-center gap-4">
          <div className="w-8 h-8 border border-[#444] flex items-center justify-center flex-shrink-0">
            <span className="text-[#666] text-sm">✕</span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#666] font-bold">
              Dia de Folga
            </p>
            <p className="text-[11px] text-[#444] mt-0.5">
              A barbearia não funciona hoje. Próximo dia: {
                new Date().getDay() === 0 ? 'Terça-feira' : 'Terça-feira'
              } às 08:00.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0F0F0F] p-4 md:p-6 border border-[#222] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-[#888]">{kpi.title}</p>
              <span className="text-[10px] font-bold text-green-500">{kpi.trend}</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-serif text-white">{kpi.value}</div>
            <div className="h-1 w-full bg-[#222]">
              <div className="h-full bg-gold-500 w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0F0F0F] p-6 border border-[#222] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-2">Controle de Fluxo</p>
          <h3 className="font-serif text-2xl text-white mb-2">Limite de Clientes Hoje</h3>
          {limite === null ? (
            <p className="text-sm text-slate-400">Atualmente não há limite definido para hoje. A agenda aceitará reservas indefinidamente.</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">A barbearia fechará automaticamente a agenda ao atingir o limite.</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden max-w-xs">
                  <div className="h-full bg-gold-500 transition-all" style={{ width: `${Math.min(100, (atendidosHoje / limite) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-white">{atendidosHoje} / {limite}</span>
              </div>
              {atendidosHoje >= limite && (
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-3 h-3" /> Limite Atingido (Agenda Fechada)
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="shrink-0 bg-[#0A0A0A] p-4 border border-[#222]">
          {limite === null ? (
            <form onSubmit={handleSetLimite} className="flex gap-2">
              <input 
                type="number" 
                min="1"
                placeholder="Ex: 30"
                value={novoLimite}
                onChange={e => setNovoLimite(e.target.value)}
                className="w-24 bg-transparent border-b border-[#333] focus:border-gold-500 text-white px-2 py-1 outline-none text-center"
              />
              <button type="submit" className="px-4 py-2 bg-gold-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors">
                Definir Limite
              </button>
            </form>
          ) : (
            <button onClick={handleRemoverLimite} className="px-6 py-3 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-900/20 transition-colors">
              Remover Limite
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Receita */}
        <div className="lg:col-span-2 bg-[#0F0F0F] p-6 border border-[#222] relative">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] uppercase tracking-widest text-[#888]">Evolução de Receita Diária</p>
            <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
              <span className="flex items-center gap-2 text-white"><span className="w-2 h-2 bg-gold-500"></span>Esta Semana</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosReceita} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '0' }}
                  itemStyle={{ color: '#C5A059' }}
                  formatter={(value) => [`R$ ${value}`, 'Receita']}
                />
                <Area type="monotone" dataKey="total" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Serviços Mais Realizados */}
        <div className="bg-[#0F0F0F] p-6 border border-[#222]">
           <p className="text-[10px] uppercase tracking-widest text-[#888] mb-8">Top Serviços</p>
           <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosServicosChart} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#222" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: '#222' }} 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '0' }}
                  itemStyle={{ color: '#C5A059' }}
                  formatter={(value) => [`${value} atendimentos`, 'Total']} 
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={20}>
                  {dadosServicosChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#C5A059' : '#333'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="bg-[#0F0F0F] border border-[#222]">
        <div className="p-6 border-b border-[#222] flex justify-between items-center">
          <h3 className="font-serif text-xl text-white">Próximos Horários</h3>
          <button className="text-[10px] uppercase tracking-tighter border border-gold-500 px-3 py-1 text-gold-500 hover:bg-gold-500 hover:text-black transition-all">Ver Todos</button>
        </div>
        <div className="divide-y divide-[#222] bg-[#222]">
          {ordenarAgendamentos(
            agendamentos.filter(a => a.status === 'Confirmado')
          ).slice(0, 5).map((act, i) => (
            <div key={act.id} className="bg-[#0A0A0A] p-4 flex items-center justify-between group cursor-pointer border-b border-[#222] last:border-b-0">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="font-serif text-gold-500 text-sm md:text-base">{act.horario}</span>
                <div className="h-8 w-px bg-[#222]"></div>
                <div>
                  <p className="text-[11px] md:text-xs font-bold uppercase tracking-tight text-white">{act.cliente}</p>
                  <p className="text-[9px] md:text-[10px] text-[#666]">{act.servico}</p>
                </div>
              </div>
              <span className={`text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 border font-bold uppercase whitespace-nowrap ${
                act.status === 'Confirmado' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 
                act.status === 'Concluído' ? 'bg-green-900/20 text-green-500 border-green-900/40' :
                act.status === 'Pendente' ? 'bg-amber-900/20 text-amber-500 border-amber-900/40' :
                'bg-red-900/20 text-red-500 border-red-900/40'
              }`}>
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
