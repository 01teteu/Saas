"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, Users, Scissors, DollarSign, Settings, LogOut, RotateCcw, Menu, X } from "lucide-react";
import { resetarDados, HORARIOS, getSolicitacoes } from "@/lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isAberta, setIsAberta] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(0);

  useEffect(() => {
    const verificar = () => {
      const pendentes = getSolicitacoes().filter(s => s.status === 'AguardandoAprovacao').length;
      setSolicitacoesPendentes(pendentes);
    };
    verificar();
    const interval = setInterval(verificar, 5000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    const getBarbeariaAberta = () => {
      const agora = new Date();
      const dia = agora.getDay();
      const horario = HORARIOS[dia];
      if (!horario) return false;
      
      const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();
      const [aberturaH, aberturaM] = horario.abertura.split(':').map(Number);
      const [fechamentoH, fechamentoM] = horario.fechamento.split(':').map(Number);
      
      return minutosAtuais >= (aberturaH * 60 + aberturaM) && minutosAtuais < (fechamentoH * 60 + fechamentoM);
    };

    const checkStatus = () => {
      setIsAberta(getBarbeariaAberta());
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Agendamentos", href: "/admin/agendamentos", icon: CalendarDays },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Serviços", href: "/admin/servicos", icon: Scissors },
    { name: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
    { name: "Configurações", href: "#", icon: Settings },
  ];

  const handleReset = () => {
    if (confirm("Isso apagará todos os agendamentos e resetará os serviços. Deseja continuar?")) {
      resetarDados();
      window.location.reload();
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#222] text-white flex font-sans selection:bg-gold-500/30">
      {/* Overlay — aparece atrás da sidebar quando aberta */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setSidebarAberta(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-72
        bg-charcoal-950 border-r border-[#222]
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#222]">
          <div className="font-serif text-lg font-bold text-white tracking-wider flex items-center gap-2">
            <div className="w-8 h-8 border border-gold-500 flex items-center justify-center">
              <span className="font-serif text-gold-500 text-sm">MR</span>
            </div>
            MR. DUQUE
          </div>
          <button onClick={() => setSidebarAberta(false)} className="text-[#666] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} onClick={() => setSidebarAberta(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-[#111] hover:text-white transition-all group border-l-2 border-transparent hover:border-gold-500">
                <Icon className="w-4 h-4 text-gold-500/50 group-hover:text-gold-500 transition-colors" />
                <span className="text-[11px] uppercase tracking-widest font-semibold">{item.name}</span>
                {item.name === 'Clientes' && solicitacoesPendentes > 0 && (
                  <span className="ml-auto bg-gold-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                    {solicitacoesPendentes}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-4 px-6 py-4 text-red-500/70 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-widest font-semibold">Sair</span>
          </Link>
          <button onClick={handleReset} className="flex items-center gap-4 px-4 py-3 text-[#444] hover:text-[#888] transition-colors w-full group">
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">↺ Resetar Demo</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        <div className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[#222] h-16 flex items-center px-4 md:px-8 gap-4">
          <button 
            onClick={() => setSidebarAberta(true)}
            className="w-10 h-10 flex items-center justify-center border border-[#333] hover:border-gold-500 hover:text-gold-500 transition-colors text-[#888] touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="font-serif text-lg text-white tracking-widest">MR. DUQUE</div>

          <div className="flex-1" />

          {isClient && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${isAberta ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[10px] uppercase tracking-widest font-semibold ${isAberta ? 'text-green-400' : 'text-red-400'}`}>
                {isAberta ? "Aberta" : "Fechada"}
              </span>
            </div>
          )}

          <Link href="/" className="text-[10px] uppercase tracking-widest text-[#666] hover:text-white transition-colors hidden md:block">
            ← Ver site
          </Link>
        </div>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto min-h-full flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
