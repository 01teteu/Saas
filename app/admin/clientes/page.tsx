"use client";

import { useState, useEffect } from "react";
import { Search, Scissors, Clock, User, Phone, Check, X, Trash2 } from "lucide-react";
import { 
  getSolicitacoes, 
  aprovarSolicitacao, 
  recusarSolicitacao,
  removerSolicitacao,
  salvarSolicitacoes,
  limparNumero,
  getAgendamentos,
  salvarAgendamentos
} from '@/lib/store';
import type { Solicitacao } from '@/lib/types';

export default function ClientesPage() {
  const [mounted, setMounted] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const carregarDados = () => {
    setSolicitacoes(getSolicitacoes());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSolicitacoes(getSolicitacoes());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSolicitacoes(getSolicitacoes());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Polling para captar novos agendamentos
  useEffect(() => {
    const interval = setInterval(() => {
      carregarDados();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAceitar = (id: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;
    
    aprovarSolicitacao(id);
    carregarDados();

    const msg = encodeURIComponent(
      `✅ *Agendamento Confirmado - Mr. Duque Barbearia*\n\n` +
      `Olá, ${sol.cliente}! Seu horário foi confirmado.\n\n` +
      `✂️ *Serviços:* ${sol.servicos}\n` +
      `🕐 *Horário:* ${sol.horario}\n` +
      `💰 *Total:* R$ ${sol.totalServicos}\n\n` +
      `Te esperamos! Qualquer dúvida é só chamar. 💈`
    );
    window.open(`https://wa.me/${limparNumero(sol.whatsapp)}?text=${msg}`, '_blank');
  };

  const handleRecusar = (id: string) => {
    recusarSolicitacao(id);
    carregarDados();
  };

  const handleExcluirHistorico = (cliente: string, whatsapp: string) => {
    // Envia WhatsApp com mensagem de problemas maiores
    const msg = encodeURIComponent(
      `⚠️ *Aviso - Mr. Duque Barbearia*\n\n` +
      `Olá, ${cliente}!\n\n` +
      `Por conta de *problemas maiores* não nos foi possível realizar seu agendamento no momento.\n\n` +
      `Agradecemos sua compreensão e pedimos desculpas pelo transtorno. ` +
      `Assim que possível entraremos em contato para remarcar. 🙏\n\n` +
      `— Mr. Duque Barbearia`
    );
    window.open(`https://wa.me/${limparNumero(whatsapp)}?text=${msg}`, '_blank');

    // Remove todos os agendamentos e solicitações desse cliente
    salvarAgendamentos(
      getAgendamentos().filter(a => 
        !(a.cliente === cliente && a.whatsapp === whatsapp)
      )
    );
    salvarSolicitacoes(
      getSolicitacoes().filter(s => 
        !(s.cliente === cliente && s.whatsapp === whatsapp)
      )
    );
    setSolicitacoes(getSolicitacoes());
  };

  const aguardando = solicitacoes.filter(s => s.status === 'AguardandoAprovacao');
  const historico = solicitacoes.filter(s => s.status !== 'AguardandoAprovacao');
  const filtradas = historico.filter(s =>
    s.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    s.whatsapp.includes(busca)
  );

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider mb-2">Solicitações de Clientes</h1>
        <p className="text-[#888] text-sm uppercase tracking-widest">Aprove ou recuse novos agendamentos</p>
      </div>

      {/* SEÇÃO 1 - Aguardando Aprovação */}
      {aguardando.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gold-500/10 border border-gold-500/20 p-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-gold-500 font-bold tracking-widest uppercase text-sm">
              {aguardando.length} solicitação(ões) aguardando aprovação
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aguardando.map(s => (
              <div key={s.id} className="border border-gold-500/30 bg-[#0F0F0F] p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-bl-full -z-10" />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-white text-xl capitalize">{s.cliente}</h3>
                    <p className="text-slate-400 text-sm mt-1">{s.whatsapp}</p>
                  </div>
                  <div className="text-gold-500 font-mono text-xl">{s.horario}</div>
                </div>

                <div className="space-y-2 flex-1">
                  <p className="text-slate-300 text-sm">
                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Serviços</span>
                    {s.servicos}
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-gold-500 font-bold">R$ {s.totalServicos}</p>
                  </div>
                  {s.barbeiro && s.barbeiro !== 'Qualquer profissional' && (
                    <p className="text-slate-400 text-xs">
                      Prefere: <span className="text-white">{s.barbeiro}</span>
                    </p>
                  )}
                </div>

                <div className="border-t border-[#222] mt-6 pt-4 flex gap-3">
                  <button 
                    onClick={() => handleAceitar(s.id)}
                    className="flex-1 bg-gold-500 text-black font-bold text-[11px] uppercase tracking-wider px-4 py-3 hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Aceitar
                  </button>
                  <button 
                    onClick={() => handleRecusar(s.id)}
                    className="flex-1 border border-red-500/50 text-red-400 font-bold text-[11px] uppercase tracking-wider px-4 py-3 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO 2 - Histórico */}
      <div className="pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-xl text-white tracking-wider">Histórico de Solicitações</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou whatsapp..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:w-64 bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-[#111] border border-[#222]">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Cliente</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">WhatsApp</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Serviços</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Total</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Horário</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold">Status</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-[#666] font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length > 0 ? (
                filtradas.map(s => (
                  <tr key={s.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors group">
                    <td className="p-4">
                      <p className="text-sm text-white capitalize">{s.cliente}</p>
                    </td>
                    <td className="p-4 text-sm text-[#888]">{s.whatsapp}</td>
                    <td className="p-4 text-sm text-[#888]">{s.servicos}</td>
                    <td className="p-4 text-sm text-gold-500">R$ {s.totalServicos}</td>
                    <td className="p-4 text-sm text-[#888]">
                      <span className="text-white mr-2">{s.data}</span>
                      {s.horario}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border ${
                        s.status === 'Aprovado' 
                          ? 'bg-green-900/20 text-green-500 border-green-900/40' 
                          : 'bg-red-900/20 text-red-400 border-red-900/40'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleExcluirHistorico(s.cliente, s.whatsapp)}
                        className="text-[#444] hover:text-red-500 transition-colors p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#666] text-sm">
                    {historico.length === 0 ? 'Nenhuma solicitação no histórico.' : 'Nenhum resultado encontrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#222]">
          {filtradas.length > 0 ? (
            filtradas.map(s => (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm uppercase tracking-tight">{s.cliente}</p>
                    <p className="text-[10px] text-[#555] font-mono mt-0.5">{s.data} às {s.horario}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-1 border font-bold uppercase ${
                    s.status === 'Aprovado'
                      ? 'bg-green-900/20 text-green-500 border-green-900/40'
                      : 'bg-red-900/20 text-red-400 border-red-900/40'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{s.servicos}</span>
                  <span className="text-gold-500 font-mono font-bold">R$ {s.totalServicos}</span>
                </div>
                <div className="flex justify-between text-xs text-[#666]">
                  <span>{s.whatsapp}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={() => handleExcluirHistorico(s.cliente, s.whatsapp)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors touch-manipulation min-h-[44px]">
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#666] text-sm">
              {historico.length === 0 ? 'Nenhuma solicitação no histórico.' : 'Nenhum resultado encontrado.'}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
