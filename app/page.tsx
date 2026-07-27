"use client";

import Image from "next/image";
import Link from "next/link";
import { Scissors, Calendar, MapPin, Clock, User, Phone, Check, CheckCircle, AlertTriangle, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { galeriaUrls, barbeiros } from "@/lib/data";
import { getServicos, adicionarSolicitacao, HORARIOS, limiteBatido, getSolicitacaoPorId } from "@/lib/store";
import { Servico, Solicitacao } from "@/lib/types";

const gallery = [
  { src: '/barbearia_limpo.png', alt: 'Allan Duque em atendimento na Mr. Duque Barbearia' },
  { src: '/corte_infantil_limpo_v2.png', alt: 'Corte infantil na Mr. Duque Barbearia' },
  { src: '/corte_cabelo_limpo.png', alt: 'Corte degradê com design na Mr. Duque Barbearia' },
];

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

export default function LandingPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServicos(getServicos());
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    barbeiro: '',
    data: '',
    horario: ''
  });
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [solicitacaoId, setSolicitacaoId] = useState<string | null>(null);
  const [statusConfirmacao, setStatusConfirmacao] = useState<'aguardando' | 'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    if (!solicitacaoId) return;
    if (statusConfirmacao === 'confirmado' || statusConfirmacao === 'recusado') return;

    const interval = setInterval(() => {
      const sol = getSolicitacaoPorId(solicitacaoId);
      if (!sol) return;
      if (sol.status === 'Aprovado') setStatusConfirmacao('confirmado');
      if (sol.status === 'Recusado') setStatusConfirmacao('recusado');
    }, 5000);

    return () => clearInterval(interval);
  }, [solicitacaoId, statusConfirmacao]);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const [showSuccess, setShowSuccess] = useState(false);
  const [agendamentoSucesso, setAgendamentoSucesso] = useState<{nome: string, servicos: string, data: string, horario: string, barbeiro: string} | null>(null);
  const [isAberta, setIsAberta] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mostrarWhatsApp, setMostrarWhatsApp] = useState(false);
  const [limiteBloqueado, setLimiteBloqueado] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setMostrarWhatsApp(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    const checkStatus = () => {
      setIsAberta(getBarbeariaAberta());
      setLimiteBloqueado(limiteBatido());
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFechadoText = () => {
    const day = new Date().getDay();
    if (day === 6 || day === 0) {
      return "Fechados no momento · Voltamos na terça-feira";
    }
    if (day === 1) {
      return "Fechados no momento · Voltamos terça-feira às 08:00";
    }
    return "Fechados no momento · Voltamos amanhã às 08:00";
  };

  const numeroBarba = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5581996652122';

  const validarNome = (valor: string): string => {
    const limpo = valor.trim();
    if (limpo.length < 3) return 'Nome muito curto';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(limpo)) return 'Nome deve conter apenas letras';
    const palavras = limpo.split(/\s+/).filter(p => p.length > 0);
    if (palavras.length < 2) return 'Informe nome e sobrenome';
    if (palavras.some(p => p.length < 2)) return 'Cada nome deve ter pelo menos 2 letras';
    return '';
  };

  const mascaraWhatsApp = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11) return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    return valor;
  };

  const validarWhatsApp = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length < 10) return 'WhatsApp inválido';
    if (numeros.length > 11) return 'WhatsApp inválido';
    return '';
  };

  const handleBlur = (campo: string) => {
    setTocados(prev => ({ ...prev, [campo]: true }));
    let erro = '';
    if (campo === 'nome') erro = validarNome(formData.nome);
    if (campo === 'whatsapp') erro = validarWhatsApp(formData.whatsapp);
    if (campo === 'data' && !formData.data) erro = 'Data obrigatória';
    if (campo === 'horario' && !formData.horario) erro = 'Horário obrigatório';
    setErros(prev => ({ ...prev, [campo]: erro }));
  };

  const toggleServico = (id: number) => {
    setServicosSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalSelecionado = servicos
    .filter(s => servicosSelecionados.includes(s.id))
    .reduce((acc, s) => acc + s.precoNumerico, 0);

  const duracaoTotal = servicos
    .filter(s => servicosSelecionados.includes(s.id))
    .reduce((acc, s) => acc + parseInt(s.duracao), 0);

  const montarMensagemWhatsApp = () => {
    const { nome, data, horario } = formData;
    const numeroBarba = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5581996652122'; // Mr. Duque — número real

    // Monta os serviços selecionados
    const servicosSelecionadosNomes = servicos
      .filter(s => servicosSelecionados.includes(s.id))
      .map(s => s.nome)
      .join(', ');

    // Mensagem personalizada com dados do formulário
    const mensagem = nome || servicosSelecionadosNomes
      ? `Olá, Mr. Duque! 👋\n\n` +
        `Meu nome é *${nome || 'não informado'}* e vim agendar o serviço de *${servicosSelecionadosNomes || 'não selecionado'}*.\n\n` +
        `${horario ? `🕐 Horário desejado: *${horario}*\n` : ''}` +
        `${data ? `📅 Data: *${data}*\n` : ''}` +
        `\nEstou aguardando a confirmação. 🙏`
      : `Olá, Mr. Duque! 👋\n\nGostaria de agendar um horário. Podem me ajudar?`;

    const url = `https://wa.me/${numeroBarba}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const isFormValido = () => {
    const nomeErro = validarNome(formData.nome);
    const wppErro = validarWhatsApp(formData.whatsapp);
    return !nomeErro && !wppErro && formData.data && formData.horario && servicosSelecionados.length > 0;
  };

  
  const getDataMinima = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getHoraMinima = (): string => {
    if (!formData.data) return '';
    const hoje = new Date().toISOString().split('T')[0];
    if (formData.data !== hoje) return '08:00'; 
    
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + 30);
    const hh = String(agora.getHours()).padStart(2, '0');
    const mm = String(agora.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const validarDataHora = (): string => {
    if (!formData.data) return 'Selecione uma data';
    if (!formData.horario) return 'Selecione um horário';
    
    const hoje = new Date().toISOString().split('T')[0];
    if (formData.data < hoje) return 'Não é possível agendar em datas passadas';
    
    if (formData.data === hoje) {
      const agora = new Date();
      agora.setMinutes(agora.getMinutes() + 30);
      const [hh, mm] = formData.horario.split(':').map(Number);
      const horarioEscolhido = new Date();
      horarioEscolhido.setHours(hh, mm, 0, 0);
      if (horarioEscolhido < agora) {
        return 'Escolha um horário com pelo menos 30 minutos de antecedência';
      }
    }
    
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nomeErro = validarNome(formData.nome);
    const wppErro = validarWhatsApp(formData.whatsapp);
    const dataErro = !formData.data ? 'Data obrigatória' : '';
    const dataHoraErro = validarDataHora();
    const horarioErro = dataHoraErro || (!formData.horario ? 'Horário obrigatório' : '');
    
    setErros({
      nome: nomeErro,
      whatsapp: wppErro,
      data: dataErro,
      horario: horarioErro
    });
    setTocados({
      nome: true,
      whatsapp: true,
      data: true,
      horario: true
    });

    if (nomeErro || wppErro || dataErro || horarioErro || servicosSelecionados.length === 0) {
      return;
    }

    const nomesServicos = servicos
      .filter(s => servicosSelecionados.includes(s.id))
      .map(s => s.nome)
      .join(', ');

    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dataFormatada = formData.data === hoje ? 'Hoje' : formData.data === amanha ? 'Amanhã' : formData.data;

    const novaSolicitacao: Solicitacao = {
      id: Date.now().toString(),
      cliente: formData.nome.trim(),
      whatsapp: formData.whatsapp,
      servicos: nomesServicos,
      totalServicos: totalSelecionado,
      barbeiro: formData.barbeiro || 'Qualquer profissional',
      data: dataFormatada,
      horario: formData.horario,
      status: 'AguardandoAprovacao',
      criadoEm: Date.now(),
    };
    adicionarSolicitacao(novaSolicitacao);
    setSolicitacaoId(novaSolicitacao.id);
    setStatusConfirmacao('aguardando');
    setAgendamentoSucesso({
      nome: formData.nome.trim(),
      servicos: nomesServicos,
      data: formData.data,
      horario: formData.horario,
      barbeiro: formData.barbeiro || 'Qualquer profissional'
    });
    setFormData({ nome: '', whatsapp: '', barbeiro: '', data: '', horario: '' });
    setServicosSelecionados([]);
    setTocados({});
    setErros({});
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-300 font-sans selection:bg-gold-500/30">
      
      {/* MODAL DE SUCESSO */}
      {agendamentoSucesso && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#222] p-8 md:p-12 max-w-md w-full text-center relative">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h3 className="font-serif text-2xl text-white mb-2">Pedido Recebido!</h3>
            <p className="text-slate-400 text-sm mb-8">
              Olá <strong className="text-white">{agendamentoSucesso.nome}</strong>, recebemos sua solicitação de agendamento.
            </p>
            
            <div className="bg-[#1a1a1a] p-4 text-left space-y-3 mb-8 border border-[#222]">
              <div className="flex justify-between items-center text-sm border-b border-[#222] pb-2">
                <span className="text-slate-500">Serviços</span>
                <span className="text-white text-right max-w-[150px] truncate">{agendamentoSucesso.servicos}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#222] pb-2">
                <span className="text-slate-500">Data e Hora</span>
                <span className="text-white">{agendamentoSucesso.data} às {agendamentoSucesso.horario}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Barbeiro</span>
                <span className="text-white">{agendamentoSucesso.barbeiro}</span>
              </div>
            </div>
            
            <div className="bg-gold-500/10 border border-gold-500/30 p-4 mb-8">
              <p className="text-gold-500 text-[11px] uppercase tracking-widest font-bold">Importante</p>
              <p className="text-sm text-slate-300 mt-1">Aguarde nossa confirmação para garantir o seu horário.</p>
            </div>

            {/* Status dinâmico — atualiza via polling */}
            {statusConfirmacao === 'aguardando' && (
              <div className="flex items-center justify-center gap-3 py-3 border border-gold-500/20 bg-gold-500/5 mb-8">
                <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                <span className="text-[11px] uppercase tracking-widest text-gold-400">
                  Aguardando confirmação do barbeiro...
                </span>
              </div>
            )}

            {statusConfirmacao === 'confirmado' && (
              <div className="mb-8 bg-green-900/20 border border-green-900/50 p-4 text-center">
                <p className="text-green-400 font-bold text-sm uppercase tracking-widest mb-1">
                  ✅ Horário Confirmado!
                </p>
                <p className="text-[11px] text-slate-400">
                  Seu agendamento foi aceito. Você pode se dirigir à barbearia no horário marcado.
                </p>
              </div>
            )}

            {statusConfirmacao === 'recusado' && (
              <div className="mb-8 bg-red-900/20 border border-red-900/40 p-4 text-center">
                <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-1">
                  ❌ Horário Não Disponível
                </p>
                <p className="text-[11px] text-slate-400">
                  O barbeiro não pôde confirmar esse horário. 
                  Entre em contato pelo WhatsApp para reagendar.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5581996652122'}`}
                  target="_blank"
                  className="inline-block mt-3 bg-gold-500 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-gold-400 transition-colors"
                >
                  Falar no WhatsApp
                </a>
              </div>
            )}
            
            <button 
              onClick={() => {
                setAgendamentoSucesso(null);
                setSolicitacaoId(null);
                setStatusConfirmacao(null);
              }}
              className="w-full bg-gold-500 text-charcoal-950 font-bold text-sm uppercase tracking-[0.15em] py-4 hover:bg-gold-400 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-charcoal-950 backdrop-blur-md border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="font-serif text-2xl font-bold text-white tracking-wider flex items-center gap-3">
            <div className="w-10 h-10 border border-gold-500 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-gold-500 text-sm font-bold tracking-tight leading-none">
                MR
              </span>
            </div>
            <span className="hidden sm:block text-lg md:text-2xl">MR. DUQUE</span>
          </div>
          <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-semibold text-[#888]">
            <a href="#servicos" className="hover:text-white transition-colors cursor-pointer">Serviços</a>
            <a href="#sobre" className="hover:text-white transition-colors cursor-pointer">Sobre</a>
            <a href="#galeria" className="hover:text-white transition-colors cursor-pointer">Galeria</a>
            <a href="#localizacao" className="hover:text-white transition-colors cursor-pointer">Localização</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <a href="#agendar" className="bg-gold-500 text-charcoal-950 px-4 py-2 text-[9px] md:px-6 md:py-2.5 md:text-[10px] font-bold uppercase tracking-widest hover:bg-gold-400 transition-all border border-gold-500 touch-manipulation cursor-pointer">
              Agendar Agora
            </a>
            <button
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              className="md:hidden w-10 h-10 flex items-center justify-center border border-[#333] text-[#888] hover:border-gold-500 hover:text-gold-500 transition-colors flex-shrink-0"
            >
              {menuMobileAberto ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {menuMobileAberto && (
          <>
            <div
              className="md:hidden fixed inset-0 z-30 bg-black/40"
              onClick={() => setMenuMobileAberto(false)}
            />
            <div className="md:hidden fixed top-20 left-0 w-full bg-charcoal-950 border-b border-[#222] z-40 py-2">
              {[
                { href: '#servicos', label: 'Serviços' },
                { href: '#sobre', label: 'Sobre' },
                { href: '#galeria', label: 'Galeria' },
                { href: '#localizacao', label: 'Localização' },
                { href: '#agendar', label: 'Agendar Agora' },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuMobileAberto(false)}
                  className="block px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-[#888] hover:text-white hover:bg-[#111] border-b border-[#111] last:border-b-0 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </>
        )}
      </header>

      {/* STATUS BANNER */}
      {isClient && (
        <div className={`fixed top-20 left-0 w-full z-40 flex justify-center py-2 px-4 border-b ${isAberta ? 'bg-green-900/30 border-green-900/50' : 'bg-red-900/20 border-red-900/30'}`}>
          <div className="flex items-center justify-center gap-2 text-center leading-relaxed">
            <div className={`w-2 h-2 rounded-full shrink-0 ${isAberta ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[10px] md:text-[11px] uppercase tracking-widest font-semibold ${isAberta ? 'text-green-400' : 'text-red-400'}`}>
              {isAberta ? "Estamos abertos agora · Ter–Sáb, 08:00 às 19:00" : getFechadoText()}
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image src="https://picsum.photos/seed/barbershophero/1920/1080" alt="Mr. Duque Barbearia Interior" fill className="object-cover opacity-20" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold-500 uppercase tracking-[0.2em] text-sm font-bold mb-4 block">Estilo & Sofisticação</span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight">
              Sua melhor versão <br/><span className="text-white/70 italic font-light">começa aqui.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
              Mais do que um corte, uma experiência. Tradição e modernidade unidas para elevar seu estilo.
            </p>
            <a href="#agendar" className="inline-flex justify-center w-full md:w-auto items-center gap-2 bg-gold-500 text-charcoal-950 px-8 py-4 font-bold text-base md:text-lg hover:bg-gold-400 transition-all hover:scale-105 active:scale-95 touch-manipulation cursor-pointer">
              <Calendar className="w-5 h-5" />
              Agendar Horário
            </a>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="py-24 bg-charcoal-900 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Nossos Serviços</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.filter(s => s.ativo).map((svc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="p-6 md:p-8 border border-charcoal-800 bg-charcoal-950 hover:border-gold-500/50 transition-colors group cursor-default"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-2xl text-white group-hover:text-gold-400 transition-colors">{svc.nome}</h3>
                  <span className="text-gold-500 font-mono font-bold text-lg">{svc.preco}</span>
                </div>
                <p className="text-slate-400 font-light mb-6">{svc.descricao}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
                  <Clock className="w-4 h-4" /> {svc.duracao}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="sobre" className="py-24 px-6 relative overflow-hidden">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <span className="text-gold-500 uppercase tracking-[0.2em] text-[11px] font-bold mb-4 block">
        Nossa História
      </span>
      <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
        Allan Duque
      </h2>
      <p className="text-lg text-slate-400 mb-5 font-light leading-relaxed">
        A Barbearia Mr. Duque nasceu da história de um homem que nunca desistiu. Allan Duque cresceu entendendo que persistência é o caminho — e foi com esse espírito que transformou sua paixão pelo ofício em um negócio próprio, construído do zero com trabalho e dedicação.
      </p>
      <p className="text-lg text-slate-400 mb-5 font-light leading-relaxed">
        Com anos de experiência no mercado de barbearias, Allan afinou sua técnica e desenvolveu um olhar único para cada cliente. Aqui não existe atendimento padrão — cada pessoa que senta na cadeira recebe atenção individual, cuidado e o respeito de quem leva o trabalho a sério.
      </p>
      <p className="text-lg text-slate-400 mb-8 font-light leading-relaxed">
        A Mr. Duque é mais do que uma barbearia. É a prova de que quando você não desiste, o seu sonho vira realidade.
      </p>
      <ul className="space-y-4 text-slate-300">
        <li className="flex items-center gap-3">
          <Check className="text-gold-500 w-5 h-5 flex-shrink-0" />
          Anos de experiência no mercado
        </li>
        <li className="flex items-center gap-3">
          <Check className="text-gold-500 w-5 h-5 flex-shrink-0" />
          Atendimento individual e personalizado
        </li>
        <li className="flex items-center gap-3">
          <Check className="text-gold-500 w-5 h-5 flex-shrink-0" />
          Ambiente climatizado e confortável
        </li>
        <li className="flex items-center gap-3">
          <Check className="text-gold-500 w-5 h-5 flex-shrink-0" />
          Produtos e técnicas premium
        </li>
      </ul>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative h-[500px] md:h-[600px]"
    >
      <div style={{ position: 'relative', height: '600px', width: '100%' }}>
        <img
          src="/barbeiro_principal_limpo-1.png"
          alt="Allan Duque — Fundador da Barbearia Mr. Duque"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
      </div>
      <div className="absolute inset-0 border-2 border-gold-500/50 m-6 pointer-events-none" />
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '16px', 
          left: '16px',
          right: '16px'
        }}
        className="bg-charcoal-950/90 border border-gold-500/30 p-4 backdrop-blur-sm"
      >
        <p className="font-serif text-white text-base md:text-lg">Allan Duque</p>
        <p className="text-[10px] uppercase tracking-widest text-gold-500 mt-1">
          Fundador & Barbeiro
        </p>
      </div>
    </motion.div>

  </div>
</section>
            {/* GALLERY */}
      <section id="galeria" className="py-24 bg-charcoal-900 px-6">
         <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Galeria de Cortes</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {gallery.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative w-full overflow-hidden bg-charcoal-950 group"
                style={{ paddingBottom: '133%' }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                transition-opacity flex items-center justify-center z-10">
                  <Scissors className="text-gold-500 w-8 h-8" />
                </div>
              </motion.div>
            ))}
          </div>
         </div>
      </section>

      {/* TESTIMONIALS */}
      

      {/* BOOKING */}
      <section id="agendar" className="py-24 bg-charcoal-900 px-6 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-charcoal-900/50 to-charcoal-950 border border-charcoal-800 p-6 md:p-8 lg:p-12 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-500" />
          
          {limiteBloqueado ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-[#111] rounded-full mx-auto flex items-center justify-center border border-[#333] mb-8">
                <AlertTriangle className="w-8 h-8 text-gold-500" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Agenda Lotada</h2>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                Atingimos nossa capacidade máxima de atendimentos para hoje.
                Por favor, retorne amanhã ou entre em contato pelo WhatsApp para verificar desistências.
              </p>
              <div className="mt-8">
                <button onClick={montarMensagemWhatsApp} className="border border-gold-500 text-gold-500 px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-gold-500 hover:text-black transition-colors touch-manipulation">
                  Falar no WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10 mt-4 md:mt-0">
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Agende seu Horário</h2>
                <p className="text-slate-400">Preencha os dados abaixo e garanta seu momento.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* GRUPO NOME/WHATSAPP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 font-semibold">Nome Completo</label>
                    <input 
                      type="text" 
                      value={formData.nome} 
                      onChange={e => setFormData({...formData, nome: e.target.value})} 
                      onBlur={() => handleBlur('nome')}
                      className={`w-full min-h-[52px] bg-transparent border-0 border-b-2 ${tocados.nome && erros.nome ? 'border-red-500' : 'border-white/10'} px-0 py-3 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-gold-500 transition-colors duration-300 font-light tracking-wide`}
                      placeholder="Seu nome" 
                    />
                    {tocados.nome && erros.nome && (
                      <span className="text-red-400 text-[10px] mt-1 block tracking-wide">{erros.nome}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 font-semibold">WhatsApp</label>
                    <input 
                      type="tel" 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: mascaraWhatsApp(e.target.value)})} 
                      onBlur={() => handleBlur('whatsapp')}
                      className={`w-full min-h-[52px] bg-transparent border-0 border-b-2 ${tocados.whatsapp && erros.whatsapp ? 'border-red-500' : 'border-white/10'} px-0 py-3 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-gold-500 transition-colors duration-300 font-light tracking-wide`}
                      placeholder="(00) 00000-0000" 
                    />
                    {tocados.whatsapp && erros.whatsapp && (
                      <span className="text-red-400 text-[10px] mt-1 block tracking-wide">{erros.whatsapp}</span>
                    )}
                  </div>
                </div>

            <div className="border-t border-white/5 my-2" />

            {/* GRUPO SERVIÇOS */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-4 font-semibold">Serviços Desejados</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {servicos.filter(s => s.ativo).map(svc => {
                  const isSelected = servicosSelecionados.includes(svc.id);
                  return (
                    <div 
                      key={svc.id}
                      onClick={() => toggleServico(svc.id)}
                      className={`${isSelected ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'border-white/10 bg-charcoal-900 hover:border-gold-500/40'} border p-4 cursor-pointer transition-all`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-serif text-white text-sm">{svc.nome}</span>
                        {isSelected && <Check className="w-4 h-4 text-gold-500" />}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[11px] text-slate-500 font-mono">{svc.duracao}</span>
                        <span className="text-gold-500 font-bold text-sm">{svc.preco}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {servicosSelecionados.length === 0 && tocados.nome && (
                <span className="text-red-400 text-[10px] mt-2 block tracking-wide">Selecione pelo menos um serviço</span>
              )}
              {servicosSelecionados.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">{servicosSelecionados.length} serviço(s) selecionado(s) · {duracaoTotal} min</span>
                  <span className="font-serif text-gold-500 text-lg font-bold">Total: R$ {totalSelecionado}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 my-2" />

            {/* GRUPO BARBEIRO */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 font-semibold">Barbeiro Preferido (Opcional)</label>
              <select 
                value={formData.barbeiro} 
                onChange={e => setFormData({...formData, barbeiro: e.target.value})} 
                className="w-full min-h-[52px] bg-transparent border-0 border-b-2 border-white/10 px-0 py-3 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-gold-500 transition-colors duration-300 font-light tracking-wide appearance-none cursor-pointer"
              >
                <option value="" className="bg-charcoal-900">Qualquer profissional</option>
                {barbeiros.map(b => <option key={b} value={b} className="bg-charcoal-900">{b}</option>)}
              </select>
            </div>

            <div className="border-t border-white/5 my-2" />

            {/* GRUPO DATA E HORA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 font-semibold">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-3 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input 
                    type="date"
                    min={getDataMinima()} 
                    value={formData.data} 
                    onChange={e => setFormData({...formData, data: e.target.value})} 
                    onBlur={() => handleBlur('data')}
                    className={`w-full min-h-[52px] bg-transparent border-0 border-b-2 ${tocados.data && erros.data ? 'border-red-500' : 'border-white/10'} pl-8 py-3 text-white text-base focus:outline-none focus:border-gold-500 transition-colors duration-300 font-light tracking-wide cursor-pointer`}
                  />
                </div>
                {tocados.data && erros.data && (
                  <span className="text-red-400 text-[10px] mt-1 block tracking-wide">{erros.data}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 font-semibold">Horário</label>
                <div className="relative">
                  <Clock className="absolute left-0 top-3 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input 
                    type="time" 
                    min={getHoraMinima()}
                    max="19:00"
                    value={formData.horario} 
                    onChange={e => setFormData({...formData, horario: e.target.value})} 
                    onBlur={() => handleBlur('horario')}
                    className={`w-full min-h-[52px] bg-transparent border-0 border-b-2 ${tocados.horario && erros.horario ? 'border-red-500' : 'border-white/10'} pl-8 py-3 text-white text-base focus:outline-none focus:border-gold-500 transition-colors duration-300 font-light tracking-wide cursor-pointer`}
                  />
                </div>
                {tocados.horario && erros.horario && (
                  <span className="text-red-400 text-[10px] mt-1 block tracking-wide">{erros.horario}</span>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValido()}
              className="w-full bg-gold-500 text-charcoal-950 font-bold text-sm uppercase tracking-[0.15em] py-5 hover:bg-gold-400 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(197,160,89,0.3)] active:scale-[0.98] touch-manipulation mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar Agendamento
            </button>
          </form>
          </>
        )}
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" className="py-24 px-6 relative bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Localização</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Card de localização */}
            <div className="bg-charcoal-950 border border-white/10 p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl text-white font-serif mb-6">Como chegar</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Av. Atlântico, 94 - Cohab</p>
                    <p className="text-slate-400 text-sm">Cabo de Santo Agostinho — PE, 54590-000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Dúvidas ou agendamentos?</p>
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5581996652122'}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-gold-500 transition-colors">
                      (81) 99665-2122
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <a 
                  href="https://maps.google.com/?q=Av.+Atlântico,+94,+Cohab,+Cabo+de+Santo+Agostinho,+PE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-charcoal-950 font-bold text-sm uppercase tracking-widest py-4 transition-all duration-300"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>

            {/* Mapa iframe */}
            <div className="relative h-[400px] lg:h-[500px] w-full border border-white/10 group overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0!2d-35.0350!3d-8.2900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAv.+Atlântico%2C+94%2C+Cohab%2C+Cabo+de+Santo+Agostinho%2C+PE!5e0!3m2!1spt-BR!2sbr!4v1"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              {/* Overlay de marca no mapa */}
              <div className="absolute bottom-4 left-4 right-4 bg-charcoal-950/90 backdrop-blur border border-white/10 p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                <p className="text-slate-400 text-xs">Av. Atlântico, 94 — Cohab, Cabo de Santo Agostinho</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-charcoal-950 py-12 px-6 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="font-serif text-2xl font-bold text-white tracking-wider flex items-center justify-center md:justify-start gap-2 mb-4">
              <Scissors className="w-6 h-6 text-gold-500" />
              MR. DUQUE
            </div>
            <p className="text-slate-500 font-light">A barbearia que redefine o seu estilo com excelência e sofisticação.</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <div className="space-y-2 text-slate-400 text-sm flex flex-col items-center md:items-start">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold-500"/> Av. Atlântico, 94 - Cohab, Cabo de Santo Agostinho — PE</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-500"/> (81) 99665-2122</p>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold mb-4">Horário</h4>
            <div className="space-y-2 text-slate-400 text-sm font-mono">
              <p>Segunda: Fechado</p>
              <p>Terça a Sábado: 08:00 às 19:00</p>
              <p>Domingo: Fechado</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-slate-600 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Mr. Duque Barbearia. Todos os direitos reservados.</p>
          <Link href="/admin" className="text-gold-500 hover:underline">Acesso Restrito (Admin)</Link>
        </div>
      </footer>

      {/* WHATSAPP FLOAT BUTTON */}
      <div className={`group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] transition-all duration-500 ${mostrarWhatsApp ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <span className="absolute right-16 md:right-20 top-1/2 -translate-y-1/2 bg-charcoal-950 border border-[#222] text-white text-[10px] uppercase tracking-widest px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Falar no WhatsApp
        </span>
        <button 
          onClick={montarMensagemWhatsApp}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_8px_32px_rgba(37,211,102,0.4)] bg-[#25D366] hover:bg-[#20c05c] transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer touch-manipulation"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
