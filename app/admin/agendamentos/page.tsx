"use client";

import { useState, useEffect } from "react";
import { Search, Filter, CalendarDays, CheckCheck, Trash2 } from "lucide-react";
import { getAgendamentos, atualizarStatusAgendamento, removerAgendamento, limparNumero } from "@/lib/store";
import { Agendamento } from "@/lib/types";

const ordenarAgendamentos = (lista: Agendamento[]): Agendamento[] => {
  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const toMinutos = (horario: string): number => {
    const [h, m] = horario.split(':').map(Number);
    return h * 60 + m;
  };

  const prioridade = (ag: Agendamento): number => {
    if (ag.status === 'Concluído') return 9999; // sempre no fim
    const minAg = toMinutos(ag.horario);
    if (ag.data === 'Hoje') {
      // Diferença em relação ao horário atual — negativos (já passou) ficam depois dos futuros
      const diff = minAg - minutosAgora;
      return diff >= 0 ? diff : 1000 + Math.abs(diff);
    }
    // Amanhã sempre depois de hoje
    return 5000 + toMinutos(ag.horario);
  };

  return [...lista].sort((a, b) => prioridade(a) - prioridade(b));
};

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState<string>("Todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

  const carregarDados = () => {
    setAgendamentos(getAgendamentos());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
  }, []);

  // Recalcular ordenação por proximidade a cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setAgendamentos([...getAgendamentos()]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const concluirAgendamento = (id: string) => {
    atualizarStatusAgendamento(id, 'Concluído');
    carregarDados();
  };

  const confirmarAgendamento = (ag: Agendamento) => {
    const msg = encodeURIComponent(`Olá, ${ag.cliente}! Confirmando seu agendamento para ${ag.servico} no dia ${ag.data} às ${ag.horario} com ${ag.barbeiro}.`);
    window.open(`https://wa.me/${limparNumero(ag.whatsapp)}?text=${msg}`, '_blank');
  };

  const iniciarExclusao = (id: string) => {
    setConfirmandoExclusao(id);
  };

  const confirmarExclusao = (id: string) => {
    const ag = agendamentos.find(a => a.id === id);
    
    if (ag) {
      // Envia WhatsApp avisando o cliente sobre o imprevisto
      const msg = encodeURIComponent(
        `⚠️ *Aviso Importante - Mr. Duque Barbearia*\n\n` +
        `Olá, ${ag.cliente}! Tudo bem?\n\n` +
        `Infelizmente precisamos informar que ocorreu um *imprevisto* e seu agendamento ` +
        `para *${ag.servico}* às *${ag.horario}* precisou ser cancelado.\n\n` +
        `Pedimos desculpas pelo transtorno. Entre em contato para reagendar o mais breve possível. 🙏\n\n` +
        `— Mr. Duque Barbearia`
      );
      window.open(`https://wa.me/${limparNumero(ag.whatsapp)}?text=${msg}`, '_blank');
    }

    removerAgendamento(id);
    setAgendamentos(getAgendamentos());
    setConfirmandoExclusao(null);
  };

  const agendamentosFiltrados = ordenarAgendamentos(
    agendamentos.filter(a => {
      const matchBusca = a.cliente.toLowerCase().includes(busca.toLowerCase());
      const matchData = filtroData === 'Todos' || a.data === filtroData;
      const matchStatus = filtroStatus === 'Todos' || a.status === filtroStatus;
      return matchBusca && matchData && matchStatus;
    })
  );

  let primeiroHojePassou = false; // Flag para destacar apenas o primeiro que não passou ainda

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider mb-2">Agendamentos</h1>
          <p className="text-[#888] text-sm uppercase tracking-widest">Controle sua agenda diária</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input 
            type="text" 
            placeholder="Buscar por cliente..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black/50 border border-[#333] text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 md:w-48">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full bg-black/50 border border-[#333] text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="Todos">Todas as Datas</option>
              <option value="Hoje">Hoje</option>
              <option value="Amanhã">Amanhã</option>
            </select>
          </div>
          
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-black/50 border border-[#333] text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="Todos">Todos Status</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222]">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#222] bg-black/20">
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Cliente</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Serviço</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Total</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Barbeiro</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Data/Hora</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Status</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentosFiltrados.length > 0 ? (
              agendamentosFiltrados.map((item) => {
                const agora = new Date();
                const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
                const [h, m] = item.horario.split(':').map(Number);
                const minutosItem = h * 60 + m;
                const passado = item.data === 'Hoje' && minutosItem < minutosAgora;
                
                let highlightClass = "";
                if (!passado && item.data === 'Hoje' && item.status === 'Confirmado' && !primeiroHojePassou) {
                  highlightClass = "border-l-2 border-l-gold-500 bg-gold-500/5";
                  primeiroHojePassou = true;
                }

                return (
                  <tr key={item.id} className={`border-b border-[#222] hover:bg-[#1a1a1a] transition-colors group ${highlightClass}`}>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-white">{item.cliente}</p>
                      <p className="text-xs text-[#666] mt-0.5">{item.whatsapp}</p>
                    </td>
                    <td className="p-4 text-sm text-[#888]">{item.servico}</td>
                    <td className="p-4 text-sm text-gold-500">
                      {item.totalServicos ? `R$ ${item.totalServicos}` : '—'}
                    </td>
                    <td className="p-4 text-sm text-[#888]">{item.barbeiro}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                          item.data === 'Hoje' ? 'bg-gold-500/20 text-gold-500' : 'bg-[#333] text-[#888]'
                        }`}>
                          {item.data}
                        </span>
                        <span className="text-white text-sm font-mono">{item.horario}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border ${
                        item.status === 'Confirmado' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-[#222] text-[#666] border-[#333]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.status === 'Confirmado' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => confirmarAgendamento(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#333] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#222] transition-colors touch-manipulation">
                            Lembrar
                          </button>
                          <button onClick={() => concluirAgendamento(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-green-500/50 text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/10 transition-colors touch-manipulation">
                            <CheckCheck className="w-3 h-3" /> Concluir
                          </button>
                          {confirmandoExclusao === item.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-red-400">Tem certeza?</span>
                              <button onClick={() => confirmarExclusao(item.id)} 
                                className="text-[10px] text-red-400 font-bold hover:text-red-300">Sim</button>
                              <button onClick={() => setConfirmandoExclusao(null)} 
                                className="text-[10px] text-[#666] hover:text-white">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => iniciarExclusao(item.id)}
                              className="text-[#444] hover:text-red-500 transition-colors p-1.5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {item.status === 'Concluído' && (
                        <div className="flex items-center justify-end">
                          {confirmandoExclusao === item.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-red-400">Tem certeza?</span>
                              <button onClick={() => confirmarExclusao(item.id)} 
                                className="text-[10px] text-red-400 font-bold hover:text-red-300">Sim</button>
                              <button onClick={() => setConfirmandoExclusao(null)} 
                                className="text-[10px] text-[#666] hover:text-white">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => iniciarExclusao(item.id)} 
                              className="text-[#444] hover:text-red-500 transition-colors p-1.5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#666] text-sm">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-[#222]">
        {agendamentosFiltrados.length > 0 ? (
          agendamentosFiltrados.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm uppercase tracking-tight">{item.cliente}</p>
                  <p className="text-[10px] text-[#555] font-mono">#{item.id}</p>
                </div>
                <span className={`text-[9px] px-2 py-1 border font-bold uppercase ${
                  item.status === 'Confirmado' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' :
                  item.status === 'Concluído' ? 'bg-green-900/20 text-green-500 border-green-900/40' :
                  'bg-[#222] text-[#888] border-[#333]'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">{item.servico}</span>
                <span className="text-gold-500 font-mono font-bold">{item.data} {item.horario}</span>
              </div>
              <div className="flex justify-between text-xs text-[#666]">
                <span>Barbeiro: {item.barbeiro}</span>
                <span>{item.whatsapp}</span>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                {item.status === 'Confirmado' && (
                        <>
                          <button onClick={() => confirmarAgendamento(item)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#333] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#222] transition-colors touch-manipulation min-h-[44px]">
                    Lembrar
                  </button>
                  <button onClick={() => concluirAgendamento(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-green-500/50 text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/10 transition-colors touch-manipulation min-h-[44px]">
                    <CheckCheck className="w-3 h-3" /> Concluir
                          </button>
                        </>
                      )}
                {confirmandoExclusao === item.id ? (
                  <div className="flex items-center gap-3 bg-red-950/30 px-4 py-2 border border-red-500/20">
                    <span className="text-[10px] text-red-400 font-bold">Tem certeza?</span>
                    <button onClick={() => confirmarExclusao(item.id)} 
                      className="text-[10px] text-red-400 font-bold uppercase hover:text-red-300 bg-red-500/10 px-3 py-1 border border-red-500/30">
                      Sim
                    </button>
                    <button onClick={() => setConfirmandoExclusao(null)} 
                      className="text-[10px] text-slate-300 uppercase hover:text-white bg-[#222] px-3 py-1 border border-[#333]">
                      Não
                    </button>
                  </div>
                ) : (
                  <button onClick={() => iniciarExclusao(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors touch-manipulation min-h-[44px]">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-[#666] text-sm">Nenhum agendamento encontrado.</div>
        )}
      </div>
      </div>
    </div>
  );
}
